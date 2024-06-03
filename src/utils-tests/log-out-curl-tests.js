import {
    commonRequestLines as req,
    commonResponseLines as res,
} from '../../tests/utils/common-lines.js';

// Tells run-tests.js to run `node tests/utils/vanilla-gus.js` as a sub process.
export const logOutSubProcessPath = 'tests/utils/vanilla-gus.js';

export const logOutCurlTests = [
    [ // See log-in-curl-tests.js for full /log-in tests.
        [ `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
          `-d`, `{"password":"my_pass","username":"superadmin"}`, `${req.origin}/log-in` ],
        [ res.http200ok ],
    ],
    [ // Incorrect method (uses GET not POST).
        [`-v`, `${req.origin}/log-out`],
        [res.http404notFound, res.jsonContentType, '{"error":"Not Found"}'],
    ],
    [ // Does not send the superadmin "cookie: ..." header.
        [
            `-v`, `-H`, req.jsonContentType,
            `-X`, `POST`, `-d`, `{"cookiesAsProps":true}`,
            `${req.origin}/log-out`,
        ],
        [res.http400badRequest, res.jsonContentType, '{"error":"Must be logged in: No cookies"}'],
    ],
    // [ // Body is invalid JSON. TODO make GUS respond to all exceptions better
    //     [
    //         `-v`, `-H`, req.jsonContentType, `-H`, req.sessionSuperadmin,
    //         `-X`, `POST`, `-d`, `{"cookiesAsProps":tru`,
    //         `${req.origin}/log-out`,
    //     ],
    //     [res.http400badRequest, '????'],
    // ],
    [ // cookiesAsProps is not undefined, null or boolean.
        [
            `-v`, `-H`, req.jsonContentType, `-H`, req.sessionSuperadmin,
            `-X`, `POST`, `-d`, `{"cookiesAsProps":0}`,
            `${req.origin}/log-out`,
        ],
        [res.http400badRequest, '< X-Powered-By: Express', '{"error":"Invalid cookiesAsProps"}'],
    ],
    [ // Successful log-out, getting the credentials as 'Set-Cookie' not JSON properties.
        [
            `-v`, `-H`, req.jsonContentType, `-H`, req.sessionSuperadmin,
            `-X`, `POST`,
            `${req.origin}/log-out`,
        ],
        [
            res.http200ok,
            '< Set-Cookie: sessionCookieUsername=logged-out; SameSite=None',
            '< Set-Cookie: sessionCookieUuid=logged-out; SameSite=None',
            {
                result: {
                    message: "'superadmin' successfully logged out",
                }
            },
        ],
    ],
    [ // Log-in again. 
        [ `-v`, `-H`, req.jsonContentType, `-X`, `POST`,
          `-d`, `{"password":"my_pass","username":"superadmin"}`, `${req.origin}/log-in` ],
        [ res.http200ok ],
    ],
    [ // Successful log-out, getting the credentials as JSON properties not 'Set-Cookie'.
        [
            `-v`, `-H`, req.jsonContentType, `-H`, req.sessionSuperadmin,
            `-X`, `POST`, `-d`, `{"cookiesAsProps":true}`,
            `${req.origin}/log-out`,
        ],
        [
            res.http200ok,
            {
                result: {
                    message: "'superadmin' successfully logged out",
                    sessionCookieUsername: 'logged-out',
                    sessionCookieUuid: 'logged-out',
                }
            },
        ],
        [ // 3rd item contains lines which must not appear in the `curl` results.
            /^< Set-Cookie: sessionCookieUsername=/,
            /^< Set-Cookie: sessionCookieUuid=/,
        ],
    ],
    [ // Cannot log-out again - you must be logged in to log out!
        [
            `-v`, `-H`, 'cookie: sessionCookieUsername=logged-out; sessionCookieUuid=logged-out',
            `${req.origin}/domains`,
        ],
        [
            res.http400badRequest,
            { error: "Must be logged in: User has been logged out" },
        ],
    ],
];
