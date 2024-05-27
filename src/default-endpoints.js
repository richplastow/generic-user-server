export const defaultEndpoints = [
    {
        method: 'get',
        path: '/',
        handler: (_req, res) => {
            res.type('txt');
            res.end('ok');
        },
    },
];
