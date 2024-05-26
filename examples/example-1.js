import { GenericUserServer } from '../index.js';
import { getFirestore } from '../src/utils/get-firestore.js';

const customEndpoints = [
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
    customEndpoints,
    domains: ['tunefields'],
    firestore: getFirestore(),
    gusName: 'example-1',
    isExample: true,
});
await example1.initialise();
