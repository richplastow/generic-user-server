import { logIn } from './utils/log-in.js';
import { logOut } from './utils/log-out.js';

export const defaultEndpoints = [
    {
        method: 'get',
        minimally: 'anon',
        path: '/',
        handler: (_req, res) => {
            res.type('txt');
            res.end('ok');
        },
    },
    {
        method: 'get',
        minimally: 'superadmin',
        path: '/collections',
        handler: async (_req, res, { firestore }) => {
            const collections = await firestore.listCollections();
            const collectionNames = collections.map(col => col.id);
            res.json({ result: collectionNames });
        },
    },
    {
        method: 'get',
        minimally: 'superadmin',
        path: '/collection/:collectionName',
        handler: async (req, res, { firestore }) => {
            const { collectionName } = req.params;
            const querySnapshot = await firestore.collection(collectionName).get();
            const result = querySnapshot.docs.reduce(
                (obj, doc) => ({ [doc.id]: doc.data(), ...obj }), {}
            );
            res.json({ result });
        },
    },
    {
        method: 'get',
        minimally: 'superadmin',
        path: '/domains',
        handler: (_req, res, gus) => {
            res.json({ result: gus.domains });
        },
    },
    {
        method: 'post',
        minimally: 'anon',
        path: `/log-in`,
        handler: async (req, res, { firestore, deps }) => {
            const { randomUUID } = deps;
            let error, result, statusCode;
            try {
                statusCode = 200;
                result = await logIn({ randomUUID }, firestore, req.body, 'gus_superadmins');
                const { sessionCookieUsername, sessionCookieUuid } = result;
                res.setHeader('Set-Cookie', [
                    `sessionCookieUsername=${sessionCookieUsername}`,
                    `sessionCookieUuid=${sessionCookieUuid}`,
                ]);
            } catch (err) {
                statusCode = 400;
                error = err.message;
            }
            res.status(statusCode);
            res.json(error ? { error } : { result });
        },
    },
    {
        method: 'post',
        minimally: 'registered',
        path: `/log-out`,
        handler: async (req, res, _gus, userKit) => {
            let error, result, statusCode;
            try { // TODO make logOut() throw exceptions, or remove `try { ...`
                statusCode = 200;
                result = await logOut(userKit);
            } catch (err) {
                statusCode = 400;
                error = err.message;
            }
            res.status(statusCode);
            res.json(error ? { error } : { result });
        },
    },
    {
        method: 'get',
        minimally: 'anon',
        path: '/is-using-mock-db',
        handler: (_req, res, { firestore }) => {
            if (firestore.databaseId === 'gus-mock-firestore') {
                res.json({ result: true });
            } else {
                res.status(404);
                res.json({ error: 'Not Found' });
            }
        },
    },
];
