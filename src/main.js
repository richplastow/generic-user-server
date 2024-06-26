import cors from 'cors';
import express from 'express';

import { defaultEndpoints } from './default-endpoints.js';
import { getUser } from './utils/get-user.js';
import { logIn } from './utils/log-in.js';
import { userCan } from './utils/user-can.js';

export class GenericUserServer {
    constructor({
        customEndpoints,
        deps,
        domains = [],
        firestore,
        gusName = 'untitled-gus',
        isExample = false,
        port = 1234,
    } = {}) {
        // Record the `constructedAt` timestamp, in Firestore format.
        this.constructedAt = deps.getNowDate('constructedAt');

        // Generate an ID for this server instance.
        const datetime = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
        const randomString = Math.random().toString(36).slice(2, 8);
        this.constructedID = `${isExample ? 'example' : 'server'}_${datetime}_${randomString}`;

        // When converting a `Timestamp` object to JSON, eg `res.json({ result })`,
        // produce a simple ISO date string, not `{"_seconds":1,"_nanoseconds":2}`.
        deps.Timestamp.prototype.toJSON = function() {
            return this.toDate().toISOString() }

        // Generate the domain-specific endpoints.
        const generatedEndpoints = [
            ...(customEndpoints || []), // use custom endpoints first
            ...defaultEndpoints, // then use defaults, eg GET / -> {"result":"ok"}
            ...domains.map(domain => ({ // then use generated, eg GET /domain/foo
                method: 'get',
                minimally: 'anon',
                path: `/domain/${domain}`,
                handler: (_req, res) => res.json({ result: 'ok' }),
            })),
            ...domains.map(domain => ({ // then use generated, eg GET /domain/foo
                method: 'post',
                minimally: 'anon',
                path: `/domain/${domain}/log-in`,
                handler: async (req, res) => {
                    let error, result, statusCode;
                    try {
                        result = await logIn(
                            deps,
                            firestore,
                            req.body,
                            res,
                            `${domain}_users`,
                        );
                        statusCode = 200;
                    } catch (err) {
                        error = err.message;
                        statusCode = 400;
                    }
                    res.status(statusCode);
                    res.json(error ? { error } : { result });
                },
            })),
        ];

        // Record constructor options as instance properties.
        this.domains = domains;
        this.deps = deps;
        this.endpoints = generatedEndpoints;
        this.firestore = firestore;
        this.gusName = gusName;
        this.isExample = isExample;
        this.port = port;

        // Create an Express instance (often called `app` in Express examples).
        // Use express.json() - built-in middleware which parses requests with
        // JSON payloads. See <http://expressjs.com/en/4x/api.html#express.json>
        // Also use cors() on all routes, to prevent cross-origin errors
        this.server = express();
        this.server.use(express.json());
        this.server.use(cors({
            credentials: true,
            origin: /./, // TODO GUS should have options to set up strict and secure CORS
        }))
    }

    async initialise() {
        // Before setting up the Express server, give the Firestore SDK an
        // opportunity to throw an exception if it cannot use our Firestore,
        // or if the mandatory collections do not exist.
        const collections = await this.firestore.listCollections();
        if (!collections.find(({ id }) => id === 'gus_daily_reports')) throw Error(
            `No 'gus_daily_reports' collection`);
        if (!collections.find(({ id }) => id === 'gus_superadmins')) throw Error(
            `No 'gus_superadmins' collection`);

        this.endpoints.forEach(({ method, minimally, path, handler }) => {
            const pathParts = path.split('/');
            const [ domain, userCollectionName ] = pathParts[1] === 'domain'
                ? [ pathParts[2], `${pathParts[2]}_users` ]
                : [ 'TOP_LEVEL', 'gus_superadmins' ];
            this.server[method](
                path,
                async (req, res) => {
                    let userKit = null; // { nowDate, nowMillis, userData, userDoc, userDocRef }
                    if (minimally !== 'anon') {
                        try {
                            userKit = await getUser(
                                this.deps,
                                req.headers.cookie,
                                this.firestore,
                                userCollectionName,
                            );
                        } catch(err) {
                            res.status(400);
                            res.json({ error: `Must be logged in: ${err.message}` });
                            return;
                        }
                        if (! userCan(minimally, userKit)) {
                            res.status(403);
                            res.json({ error: 'Insufficient permissions' });
                            return;
                        }
                    }
                    handler(req, res, this, userKit);
                },
            );
        });

        // Respond with a 404 Not Found error if no route matches the request.
        // TODO -X post response is blank?
        this.server.use(function(req, res, _next) {
            res.status(404);
            res.json({ error: 'Not Found' });
        });

        this.server.listen(this.port, () => {
            console.log(`GUS ${this.gusName}, DB ${this.firestore.databaseId}, PORT ${this.port}`);
        });

        // Check that every '*_users' collection has an admin. Also, add any
        // missing '*_users' collections.
        this.domains.forEach(async domain => {
            const collName = `${domain}_users`;
            const hasColl = collections.find(({ id }) => id === collName);
            const adminDocRef = this.firestore.doc(`${collName}/admin`);
            if (hasColl) {
                const adminDoc = await adminDocRef.get();
                if (!adminDoc.exists) throw Error(
                    `${collName} has no admin`);
                if (!adminDoc.get('isAdmin')) throw Error(
                    `${collName}/admin isAdmin is falsey`);
                return; // the admin user seems ok for this domain
            }
            await adminDocRef.set({
                isAdmin: true,
                pwHash: 'AWAITING COMPLETION',
                pwSalt: 'AWAITING COMPLETION',
            });
        });

        // Record to the Firestore database that this GUS instance was
        // successfully initialised.
        const document = this.firestore.doc(
            `gus_daily_reports/${(new Date()).toISOString().slice(0, 10)}_${this.constructedID}`
        );
        const { getNowDate, Timestamp } = this.deps;
        this.initialisedAt = getNowDate('initialisedAt');
        await document.set({
            constructedAt: Timestamp.fromDate(this.constructedAt),
            constructedID: this.constructedID,
            gusName: this.gusName,
            initialisedAt: Timestamp.fromDate(this.initialisedAt),
            isExample: this.isExample,
        });
    }
}
