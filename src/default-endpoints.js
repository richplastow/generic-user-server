import { logIn } from './utils/log-in.js';
import { logOut } from './utils/log-out.js';
import { maybeToTimestamp } from './utils/maybe-to-timestamp.js';

export const defaultEndpoints = [

    // Anonymous, top-level endpoints.
    {
        method: 'get',
        minimally: 'anon',
        path: '/',
        handler: (_req, res) => {
            res.header('Access-Control-Allow-Origin');
            res.type('txt');
            res.end('ok');
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

    // Superuser session management.
    {
        method: 'post',
        minimally: 'anon',
        path: `/log-in`,
        handler: async (req, res, { firestore, deps }) => {
            let error, result, statusCode;
            try {
                result = await logIn(
                    deps,
                    firestore,
                    req.body,
                    res,
                    'gus_superadmins'
                );
                statusCode = 200;
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
        minimally: 'superadmin',
        path: `/log-out`,
        handler: async (req, res, _gus, userKit) => {
            let error, result, statusCode;
            try {
                result = await logOut(
                    userKit,
                    req.body,
                    res,
                );
                statusCode = 200;
            } catch (err) {
                statusCode = 400;
                error = err.message;
            }
            res.status(statusCode);
            res.json(error ? { error } : { result });
        },
    },

    // Endpoints for superadmins to read server settings.
    {
        method: 'get',
        minimally: 'superadmin',
        path: '/domains',
        handler: (_req, res, gus) => {
            res.json({ result: gus.domains });
        },
    },

    // Endpoints for superadmins to query and edit the database.
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
        path: '/documents/:collectionName',
        handler: async (req, res, { firestore }) => {
            const { collectionName } = req.params;
            const docRefs = await firestore.collection(collectionName).listDocuments();
            const result = docRefs.map(docRef => docRef.id);
            res.json({ result });
        },
    },
    {
        method: 'get',
        minimally: 'superadmin',
        path: '/document/:collectionName/:documentId',
        handler: async (req, res, { firestore }) => {
            const { collectionName, documentId } = req.params;
            const docRef = firestore.doc(`${collectionName}/${documentId}`);
            const doc = await docRef.get();
            const result = doc.data();
            res.json({ result });
        },
    },
    {
        method: 'put',
        minimally: 'superadmin',
        path: '/document/:collectionName/:documentId',
        handler: async (req, res, { deps, firestore }) => {
            const { collectionName, documentId } = req.params;
            const updates = maybeToTimestamp(deps, req.body);
            const docRef = firestore.doc(`${collectionName}/${documentId}`);
            await docRef.update(updates);
            res.json({ result: 'ok' });
        },
    },
    {
        method: 'get',
        minimally: 'superadmin',
        path: '/dump-collection/:collectionName',
        handler: async (req, res, { firestore }) => {
            const { collectionName } = req.params;
            const querySnapshot = await firestore.collection(collectionName).get();
            const result = querySnapshot.docs.reduce(
                (obj, doc) => ({ [doc.id]: doc.data(), ...obj }), {}
            );
            res.json({ result });
        },
    },
];
