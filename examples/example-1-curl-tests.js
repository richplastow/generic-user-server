import {
    commonRequestLines as req,
    commonResponseLines as res,
} from '../tests/utils/common-lines.js';

// Tells run-tests.js to run `node examples/example-1.js` as a sub process.
export const example1SubProcessPath = 'examples/example-1.js';

export const example1CurlTests = [
    [
        [`-v`, `${req.origin}/is-using-mock-db`],
        [res.http200ok, res.jsonContentType, '< X-Powered-By: Express', '{"result":true}'],
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
