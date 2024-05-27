import { GenericUserServer } from '../index.js';
import { getFirestore } from '../src/utils/get-firestore.js';
import { getMockFirestore } from '../src/utils/get-mock-firestore.js';

const customEndpoints = [
    {
        method: 'get',
        path: '/domains',
        handler: (_req, res, gus) => {
            res.json({ result: gus.domains });
        },
    },
    {
        method: 'get',
        path: '/is-using-mock-db',
        handler: (_req, res) => {
            res.json({ result: !process.env.GUS_FIRESTORE_JSON_KEY });
        },
    },
    {
        method: 'post',
        path: '/parse-body',
        handler: (req, res) => {
            res.json({ result: req.body.name });
        },
    }
];

const mockCollections = [
    {
        id: 'gus_insts_daily',
    },
    {
        id: 'tunefields_users',
        admin: {
            isAdmin: true,
            pwHash: '2aa04e2e4fd0d86d5f4cf5063e671ec8',
            pwSalt: 'my_salt',
        }
    },
];

const example1 = new GenericUserServer({
    adminPwHash: process.env.GUS_PW_HASH || '2aa04e2e4fd0d86d5f4cf5063e671ec8',
    adminPwSalt: process.env.GUS_PW_SALT || 'my_salt',
    customEndpoints,
    domains: ['tunefields'],
    firestore: process.env.GUS_FIRESTORE_JSON_KEY
        ? getFirestore() : getMockFirestore(mockCollections),
    gusName: 'example-1',
    isExample: true,
});
await example1.initialise();
