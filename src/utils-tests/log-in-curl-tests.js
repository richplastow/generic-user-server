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
    //     [res.http400badRequest, '????'],
    // ],
    [ // cookiesAsProps is not undefined, null or boolean.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"cookiesAsProps":"","password":"my_pass","username":"superadmin"}`,
            `${req.origin}/log-in`,
        ],
        [res.http400badRequest, '{"error":"Invalid cookiesAsProps"}'],
    ],
    [ // for1Week is not undefined, null or boolean.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"for1Week":0,"password":"my_pass","username":"superadmin"}`,
            `${req.origin}/log-in`,
        ],
        [res.http400badRequest, '{"error":"Invalid for1Week"}'],
    ],
    [ // Password is not a string.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"cookiesAsProps":true,"password":123,"username":"superadmin"}`,
            `${req.origin}/log-in`,
        ],
        [res.http400badRequest, '{"error":"Invalid password"}'],
    ],
    [ // No such username.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"cookiesAsProps":null,"for1Week":null,"password":"my_pass","username":"admin"}`,
            `${req.origin}/log-in`,
        ],
        [res.http400badRequest, '{"error":"No such username"}'],
    ],
    [ // Incorrect password.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"cookiesAsProps":false,"for1Week":false,"password":"nope","username":"superadmin"}`,
            `${req.origin}/log-in`,
        ],
        [res.http400badRequest, '{"error":"Incorrect password"}'],
    ],
    [ // Successful log-in for 2 hours, getting the credentials as 'Set-Cookie' not JSON properties.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"for1Week":false,"password":"my_pass","username":"superadmin"}`,
            `${req.origin}/log-in`,
        ],
        [
            res.http200ok,
            '< Set-Cookie: sessionCookieUsername=superadmin; SameSite=None',
            '< Set-Cookie: sessionCookieUuid=12345678-abcd-cdef-1234-0123456789ab; SameSite=None',
            {
                result: {
                    message: "'superadmin' successfully logged in",
                    sessionCookieExpires: '2024-05-29T18:26:52.345Z',
                }
            },
        ],
    ],
    [ // Already logged in, `cookiesAsProps` is `true`. Note that the expiry DOES NOT change to 1 week in the future.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"cookiesAsProps":true,"for1Week":true,"password":"my_pass","username":"superadmin"}`,
            `${req.origin}/log-in`,
        ],
        [
            res.http200ok,
            {
                result: {
                    message: "'superadmin' was already logged in",
                    sessionCookieExpires: '2024-05-29T18:26:52.345Z',
                    sessionCookieUsername: "superadmin",
                    sessionCookieUuid: "12345678-abcd-cdef-1234-0123456789ab",
                }
            },
        ],
        [ // 3rd item contains lines which must not appear in the `curl` results.
            /^< Set-Cookie: sessionCookieUsername=/,
            /^< Set-Cookie: sessionCookieUuid=/,
        ],
    ],
    [ // Already logged in, `cookiesAsProps` is falsey. Note that the expiry DOES NOT change to 1 week in the future.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"cookiesAsProps":null,"for1Week":true,"password":"my_pass","username":"superadmin"}`,
            `${req.origin}/log-in`,
        ],
        [
            res.http200ok,
            '< Set-Cookie: sessionCookieUsername=superadmin; SameSite=None',
            '< Set-Cookie: sessionCookieUuid=12345678-abcd-cdef-1234-0123456789ab; SameSite=None',
            {
                result: {
                    message: "'superadmin' was already logged in",
                    sessionCookieExpires: '2024-05-29T18:26:52.345Z',
                }
            },
        ],
    ],
    [ // ...log-out, just so we can try logging-in again...
        [`-v`, `-H`, req.sessionSuperadmin, `-X`, `POST`, `${req.origin}/log-out`],
        [res.http200ok, `{"result":{"message":"'superadmin' successfully logged out"}}`],
    ],
    [ // Successful log-in, getting the credentials as JSON properties, not 'Set-Cookie'.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"cookiesAsProps":true,"for1Week":true,"password":"my_pass","username":"superadmin"}`,
            `${req.origin}/log-in`,
        ],
        [
            res.http200ok,
            {
                result: {
                    message: "'superadmin' successfully logged in",
                    sessionCookieExpires: '2024-06-05T16:26:52.345Z',
                    sessionCookieUsername: "superadmin",
                    sessionCookieUuid: "12345678-abcd-cdef-1234-0123456789ab",
                }
            },
        ],
        [ // 3rd item contains lines which must not appear in the `curl` results.
            /^< Set-Cookie: sessionCookieUsername=/,
            /^< Set-Cookie: sessionCookieUuid=/,
        ],
    ],
    [ // Already logged in, `cookiesAsProps` is `true`. Note that the expiry DOES NOT change to 2 hours in the future.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"cookiesAsProps":true,"for1Week":false,"password":"my_pass","username":"superadmin"}`,
            `${req.origin}/log-in`,
        ],
        [
            res.http200ok,
            {
                result: {
                    message: "'superadmin' was already logged in",
                    sessionCookieExpires: '2024-06-05T16:26:52.345Z',
                    sessionCookieUsername: "superadmin",
                    sessionCookieUuid: "12345678-abcd-cdef-1234-0123456789ab",
                }
            },
        ],
        [ // 3rd item contains lines which must not appear in the `curl` results.
            /^< Set-Cookie: sessionCookieUsername=/,
            /^< Set-Cookie: sessionCookieUuid=/,
        ],
    ],
    [ // Already logged in, `cookiesAsProps` is falsey. Note that the expiry DOES NOT change to 2 hours in the future.
        [
            `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
            `-d`, `{"for1Week":true,"password":"my_pass","username":"superadmin"}`,
            `${req.origin}/log-in`,
        ],
        [
            res.http200ok,
            '< Set-Cookie: sessionCookieUsername=superadmin; SameSite=None',
            '< Set-Cookie: sessionCookieUuid=12345678-abcd-cdef-1234-0123456789ab; SameSite=None',
            {
                result: {
                    message: "'superadmin' was already logged in",
                    sessionCookieExpires: '2024-06-05T16:26:52.345Z',
                }
            },
        ],
    ],
];
