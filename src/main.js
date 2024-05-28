import { Timestamp } from '@google-cloud/firestore';
import express from 'express';

import { defaultEndpoints } from './default-endpoints.js';
import { getUser } from './utils/get-user.js';
import { logIn } from './utils/log-in.js';
import { userCan } from './utils/user-can.js';

export class GenericUserServer {
    constructor({
        customEndpoints,
        deps,
        domains,
        firestore,
        gusName,
        isExample = false,
        port = 1234,
    } = {}) {
        // Record the `constructedAt` timestamp, in Firestore format.
        this.constructedAt = Timestamp.now();

        // Generate an ID for this server instance.
        const datetime = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
        const randomString = Math.random().toString(36).slice(2, 8);
        this.constructedID = `${isExample ? 'example' : 'server'}_${datetime}_${randomString}`;

        this.domains = domains || [];
        this.deps = deps;
        this.firestore = firestore;
        this.gusName = gusName || 'untitled-gus';
        this.isExample = isExample;
        this.port = port;
        this.server = express();

        // Generate the `endpoints` array.
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
                    const { randomUUID } = this.deps;
                    let error, result, statusCode;
                    try {
                        result = await logIn({ randomUUID }, this.firestore, req.body, `${domain}_users`);
                        statusCode = 200;
                        const { sessionCookieUsername, sessionCookieUuid } = result;
                        res.setHeader('Set-Cookie', [
                            `sessionCookieUsername=${sessionCookieUsername}`,
                            `sessionCookieUuid=${sessionCookieUuid}`,
                        ]);
                    } catch (err) {
                        error = err.message;
                        statusCode = 400;
                    }
                    res.status(statusCode);
                    res.json(error ? { error } : { result });
                },
            })),
        ];

        this.endpoints = generatedEndpoints;

        // Use express.json() - built-in middleware which parses requests with
        // JSON payloads. See <http://expressjs.com/en/4x/api.html#express.json>
        this.server.use(express.json());
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
                    let user = null;
                    if (minimally !== 'anon') {
                        try {
                            user = await getUser(req.headers.cookie, this.firestore, userCollectionName);
                        } catch(err) {
                            res.status(400);
                            res.json({ error: `Must be logged in: ${err.message}` });
                            return;
                        }
                        if (! userCan(user, minimally)) {
                            res.status(403);
                            res.json({ error: 'Insufficient permissions' });
                            return;
                        }
                    }
                    handler(req, res, this, user);
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
        this.initialisedAt = Timestamp.now();
        await document.set({
            constructedAt: this.constructedAt,
            constructedID: this.constructedID,
            gusName: this.gusName,
            initialisedAt: this.initialisedAt,
            isExample: this.isExample,
        });
    }
}
