import {
    commonRequestLines as req,
    commonResponseLines as res,
} from '../tests/utils/common-lines.js';

// Tells run-tests.js to run `node examples/example-1.js` as a sub process.
export const example1SubProcessPath = 'examples/example-1.js';

export const example1CurlTests = [
    [
        [`-v`, `${req.origin}/domain/tunefields`],
        [res.http200ok, '{"result":"ok"}'],
    ],
    [
        ['-v', '-H', req.jsonContentType, '-X', 'POST', '-d', '{"name":"hi!"}', `${req.origin}/parse-body`],
        [res.http200ok, res.jsonContentType, '{"result":"hi!"}'],
    ],
    [
        [`-v`, `${req.origin}/domains`], // without session cookie
        [res.http400badRequest, res.jsonContentType, '{"error":"Must be logged in: No cookies"}'],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/domains`], // with session cookie, but we didn't log in yet
        [res.http400badRequest, '{"error":"Must be logged in: Incorrect sessionCookieUuid"}'],
    ],

    // Logged in as a superadmin, can access top-level routes.
    [
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, '{"username":"superadmin","password":"my_pass"}', `${req.origin}/log-in`],
        [res.http200ok, {result:{
            message: "'superadmin' successfully logged in",
            sessionCookieUsername: "superadmin",
            sessionCookieUuid: "12345678-abcd-cdef-1234-0123456789ab",
        }}],
    ],
    [
        [`-v`, `${req.origin}/domains`], // without session cookie, even though we logged in
        [res.http400badRequest, '{"error":"Must be logged in: No cookies"}'],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/domains`], // with session cookie
        [res.http200ok, '{"result":["tunefields"]}'],
    ],
];
