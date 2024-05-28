import { logIn } from './utils/log-in.js';

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
        method: 'post',
        minimally: 'anon',
        path: `/log-in`,
        handler: async (req, res, { firestore, deps }) => {
            const { randomUUID } = deps;
            let result, statusCode;
            try {
                result = await logIn({ randomUUID }, firestore, req.body, 'gus_superadmins');
                statusCode = 200;
                const { sessionCookieUsername, sessionCookieUuid } = result;
                res.setHeader('Set-Cookie', [
                    `sessionCookieUsername=${sessionCookieUsername}`,
                    `sessionCookieUuid=${sessionCookieUuid}`,
                ]);
            } catch (err) {
                result = { error: err.message };
                statusCode = 400;
            }
            res.status(statusCode);
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
