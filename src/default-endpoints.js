export const defaultEndpoints = [
    {
        method: 'get',
        path: '/',
        handler: (_req, res) => {
            res.json({ result: 'ok' });
        },
    },
];
