import express from 'express';

import { defaultEndpoints } from './default-endpoints.js';
import { Timestamp } from '@google-cloud/firestore';

export class GenericUserServer {
    constructor({
        customEndpoints,
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

        // Generate the `endpoints` array.
        const generatedEndpoints = [
            ...(customEndpoints || []), // use custom endpoints first
            ...defaultEndpoints, // then use defaults, eg GET / -> {"result":"ok"}
            ...domains.map(domain => ({ // then use generated, eg GET /domain/foo
                method: 'get',
                path: `/domain/${domain}`,
                handler: (_req, res) => res.json({ result: 'ok' }),
            })),
        ];

        this.domains = domains || [];
        this.endpoints = generatedEndpoints;
        this.firestore = firestore;
        this.gusName = gusName || 'untitled-gus';
        this.isExample = isExample;
        this.port = port;
        this.server = express();

        // Use express.json() - built-in middleware which parses requests with
        // JSON payloads. See <http://expressjs.com/en/4x/api.html#express.json>
        this.server.use(express.json());
    }

    async initialise() {
        this.endpoints.forEach(({ method, path, handler }) => {
            this.server[method](path, (req, res) => handler(req, res, this));
        });

        // Respond with a 404 Not Found error if no route matches the request.
        this.server.use(function(req, res, next) {
            res.status(404);
            res.json({ error: 'Not Found' });
        });

        this.server.listen(this.port, () => {
            console.log(`${this.gusName} listening on port ${this.port}`);
        });

        // Record to the Firestore database that this GUS instance was
        // successfully initialised.
        const collections = await this.firestore.listCollections();
        if (!collections.find(({ id }) => id === 'gus_insts_daily')) throw Error(
            `No 'gus_insts_daily' collection`);
        const document = this.firestore.doc(
            `gus_insts_daily/${(new Date()).toISOString().slice(0, 10)}_${this.constructedID}`
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
