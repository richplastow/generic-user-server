import { GenericUserServer } from '../index.js';

const endpoints = [
    {
        method: 'get',
        path: '/ping',
        handler: (_req, res) => {
            res.send('{"result":"pong"}');
        },
    },
    {
        method: 'post',
        path: '/parse-body',
        handler: (req, res) => {
            res.send(JSON.stringify({ result:req.body.name }));
        },
    }
];

const example1 = new GenericUserServer({ endpoints, gusName: 'example-1' });
example1.initialise();
