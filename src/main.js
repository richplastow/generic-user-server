import express from 'express';

import { defaultEndpoints } from './default-endpoints.js';

export class GenericUserServer {
    constructor({
        domains,
        endpoints,
        gusName,
        port,
    } = {}) {
        // Generate the `endpoints` array.
        const generatedEndpoints = [
            ...(endpoints || []), // use custom endpoints first
            ...defaultEndpoints, // then use defaults, eg GET / -> {"result":"ok"}
            ...domains.map(domain => ({ // then use generated, eg GET /domain/foo
                method: 'get',
                path: `/domain/${domain}`,
                handler: (_req, res) => {
                    res.json({ result: 'ok'});
                },        
            })),
        ];

        this.domains = domains || [];
        this.endpoints = generatedEndpoints;
        this.gusName = gusName || 'untitled-gus';
        this.port = port || 1234;
        this.server = express();

        // Use express.json() - built-in middleware which parses requests with
        // JSON payloads. See <http://expressjs.com/en/4x/api.html#express.json>
        this.server.use(express.json());
    }

    initialise() {
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
    }
}
