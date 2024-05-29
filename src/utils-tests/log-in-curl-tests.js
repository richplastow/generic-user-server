import {
    commonRequestLines as req,
    commonResponseLines as res,
} from '../../tests/utils/common-lines.js';

// Tells run-tests.js to run `node tests/utils/vanilla-gus.js` as a sub process.
export const logInSubProcessPath = 'tests/utils/vanilla-gus.js';

export const logInCurlTests = [
    [ // Incorrect method (uses GET not POST).
        [`-v`, `${req.origin}/log-in`],
        [res.http404notFound, res.jsonContentType, '{"error":"Not Found"}'],
    ],
    [ // Missing a body.
        [`-v`, `-X`, `POST`, `${req.origin}/log-in`],
        [res.http400badRequest, '< X-Powered-By: Express', '{"error":"Invalid username"}'],
    ],
    [ // Password is not a string.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"username":"superadmin","password":123}`, `${req.origin}/log-in`],
        [res.http400badRequest, '{"error":"Invalid password"}'],
    ],
    [ // No such username.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"username":"admin","password":"my_pass"}`, `${req.origin}/log-in`],
        [res.http400badRequest, '{"error":"No such username"}'],
    ],
    [ // Incorrect password.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"username":"superadmin","password":"nope"}`, `${req.origin}/log-in`],
        [res.http400badRequest, '{"error":"Incorrect password"}'],
    ],
    [ // Successful log-in.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"username":"superadmin","password":"my_pass"}`, `${req.origin}/log-in`],
        [res.http200ok, {result:{
            message: "'superadmin' successfully logged in",
            sessionCookieUsername: "superadmin",
            sessionCookieUuid: "12345678-abcd-cdef-1234-0123456789ab",
        }}],
    ],
    [ // Already logged in.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"username":"superadmin","password":"my_pass"}`, `${req.origin}/log-in`],
        [res.http200ok, {result:{
            message: "'superadmin' was already logged in",
            sessionCookieUsername: "superadmin",
            sessionCookieUuid: "12345678-abcd-cdef-1234-0123456789ab",
        }}],
    ],
];
