import { commonRequestLines as req, commonResponseLines as res } from './common-lines.js';

export const example1CurlTests = [
    [
        [`-v`, `${req.origin}/ping`],
        [res.http200ok, res.jsonContentType, '< X-Powered-By: Express', '{"result":"pong"}'],
    ],
    [
        ['-v', '-H', req.jsonContentType, '-X', 'POST', '-d', '{"name":"hi!"}', `${req.origin}/parse-body`],
        [res.http200ok, res.jsonContentType, '{"result":"hi!"}'],
    ],
];
