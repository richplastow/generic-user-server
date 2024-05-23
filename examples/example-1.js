import { GenericUserServer } from '../index.js';

const endpoints = [
    {
        method: 'get',
        path: '/domains',
        handler: (_req, res, gus) => {
            res.json({ result:gus.domains });
        },
    },
    {
        method: 'post',
        path: '/parse-body',
        handler: (req, res) => {
            res.json({ result:req.body.name });
        },
    }
];

const example1 = new GenericUserServer({
    domains: ['tunefields'],
    endpoints,
    gusName: 'example-1',
});
example1.initialise();
