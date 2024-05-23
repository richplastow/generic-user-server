import { commonRequestLines as req, commonResponseLines as res } from './common-lines.js';

export const example1CurlTests = [
    [
        [`-v`, `${req.origin}/`],
        [res.http200ok, res.jsonContentType, '< X-Powered-By: Express', '{"result":"ok"}'],
    ],
    [
        [`-v`, `${req.origin}/domains`],
        [res.http200ok, res.jsonContentType, '{"result":["tunefields"]}'],
    ],
    [
        [`-v`, `${req.origin}/domain/nope`],
        [res.http404notFound, res.jsonContentType, '{"error":"Not Found"}'],
    ],
    [
        [`-v`, `${req.origin}/domain/tunefields`],
        [res.http200ok, '{"result":"ok"}'],
    ],
    [
        ['-v', '-H', req.jsonContentType, '-X', 'POST', '-d', '{"name":"hi!"}', `${req.origin}/parse-body`],
        [res.http200ok, res.jsonContentType, '{"result":"hi!"}'],
    ],
];
