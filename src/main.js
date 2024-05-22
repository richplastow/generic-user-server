import express from 'express';

export class GenericUserServer {
    constructor({
        endpoints,
        gusName,
        port,
    } = {}) {
        this.endpoints = endpoints || [],
        this.gusName = gusName || 'untitled-gus',
        this.port = port || 1234;
        this.server = express();

        // Use express.json() - built-in middleware which parses requests with
        // JSON payloads. See <http://expressjs.com/en/4x/api.html#express.json>
        this.server.use(express.json());

        // Use custom middleware to set JSON as the content-type of every
        // response. Based on <https://stackoverflow.com/a/52823024>
        this.server.use((_req, res, next) => {
            res.setHeader('Content-Type', 'application/json');
            next();
        });
    }

    initialise() {
        this.endpoints.forEach(({ method, path, handler }) => {
            this.server[method](path, handler);                
        });
        this.server.listen(this.port, () => {
            console.log(`${this.gusName} listening on port ${this.port}`);
        });          
    }
}
