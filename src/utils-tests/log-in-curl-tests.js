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
        [res.http400badRequest, '< X-Powered-By: Express', '{"error":"Invalid password"}'],
    ],
    // [ // Body is invalid JSON. TODO make GUS respond to all exceptions better
    //     [`-v`, `-X`, `POST`, `-d`, `{"password":"my_pass","username":"supe`, `${req.origin}/log-in`],
    //     [res.http400badRequest, '< X-Powered-By: Express', '{"error":"Invalid password"}'],
    // ],
    [ // for1Week is not undefined, null or boolean.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"for1Week":0,"password":"my_pass","username":"superadmin"}`, `${req.origin}/log-in`],
        [res.http400badRequest, '{"error":"Invalid for1Week"}'],
    ],
    [ // Password is not a string.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"password":123,"username":"superadmin"}`, `${req.origin}/log-in`],
        [res.http400badRequest, '{"error":"Invalid password"}'],
    ],
    [ // No such username.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"for1Week":null,"password":"my_pass","username":"admin"}`, `${req.origin}/log-in`],
        [res.http400badRequest, '{"error":"No such username"}'],
    ],
    [ // Incorrect password.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"for1Week":false,"password":"nope","username":"superadmin"}`, `${req.origin}/log-in`],
        [res.http400badRequest, '{"error":"Incorrect password"}'],
    ],
    [ // Successful log-in.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"for1Week":true,"password":"my_pass","username":"superadmin"}`, `${req.origin}/log-in`],
        [res.http200ok, {result:{
            message: "'superadmin' successfully logged in",
            sessionCookieExpires: "2024-06-05T16:26:52.345Z",
            sessionCookieUsername: "superadmin",
            sessionCookieUuid: "12345678-abcd-cdef-1234-0123456789ab",
        }}],
    ],
    [ // Already logged in. Note that the expiry changes to 2 hours in the future.
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, `{"for1Week":false,"password":"my_pass","username":"superadmin"}`, `${req.origin}/log-in`],
        [res.http200ok, {result:{
            message: "'superadmin' was already logged in",
            sessionCookieExpires: '2024-06-05T16:26:52.345Z',
            sessionCookieUsername: "superadmin",
            sessionCookieUuid: "12345678-abcd-cdef-1234-0123456789ab",
        }}],
    ],
];
