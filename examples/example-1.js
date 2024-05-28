import { webcrypto } from 'node:crypto';
import { GenericUserServer } from '../index.js';
import { getFirestore } from '../src/utils/get-firestore.js';
import { getMockFirestore } from '../src/utils/get-mock-firestore.js';

const customEndpoints = [
    {
        method: 'post',
        minimally: 'anon',
        path: '/parse-body',
        handler: (req, res) => {
            res.json({ result: req.body.name });
        },
    }
];

const mockCollections = [
    {
        id: 'gus_daily_reports',
    },
    {
        id: 'gus_superadmins',
        superadmin: {
            isSuperadmin: true,
            pwHash: '2aa04e2e4fd0d86d5f4cf5063e671ec8',
            pwSalt: 'my_salt',
        },
    },
    {
        id: 'tunefields_users',
        admin: {
            isAdmin: true,
            pwHash: '2aa04e2e4fd0d86d5f4cf5063e671ec8',
            pwSalt: 'my_salt',
        },
    },
];

const example1 = new GenericUserServer({
    customEndpoints,
    deps: {
        randomUUID: process.env.GUS_FIRESTORE_JSON_KEY
            ? webcrypto.randomUUID.bind(webcrypto)
            : () => '12345678-abcd-cdef-1234-0123456789ab',
    },
    domains: ['tunefields'],
    firestore: process.env.GUS_FIRESTORE_JSON_KEY
        ? getFirestore() : getMockFirestore(mockCollections),
    gusName: 'example-1',
    isExample: true,
});
await example1.initialise();
