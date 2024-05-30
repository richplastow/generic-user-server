import {
    commonRequestLines as req,
    commonResponseLines as res,
} from './utils/common-lines.js';

// Tells run-tests.js to run `node tests/utils/vanilla-gus.js` as a sub process.
export const topLevelSubProcessPath = 'tests/utils/vanilla-gus.js';

export const topLevelCurlTests = [
    [
        [`-v`, `${req.origin}/`], // session cookie not needed for this endpoint
        [res.http200ok, '< Content-Type: text/plain; charset=utf-8', 'ok'],
    ],
    [
        [`-v`, `${req.origin}/is-using-mock-db`], // again, session cookie not needed for this endpoint
        [res.http200ok, res.jsonContentType, '{"result":true}'],
    ],
    [
        [`-v`, `${req.origin}/collections`], // fails, because session cookie is needed
        [res.http400badRequest, '{"error":"Must be logged in: No cookies"}'],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/collections`], // fails with session cookie, because we didn't log in yet
        [res.http400badRequest, '{"error":"Must be logged in: Incorrect sessionCookieUuid"}'],
    ],
    [
        [`-v`, `${req.origin}/collection/gus_superadmins`], // fails again, because session cookie is needed
        [res.http400badRequest, '{"error":"Must be logged in: No cookies"}'],
    ],
    [
        [`-v`, `${req.origin}/collection/gus_superadmins/superadmin`], // fails again, because session cookie is needed
        [res.http400badRequest, '{"error":"Must be logged in: No cookies"}'],
    ],
    [
        [`-v`, `${req.origin}/domains`], // fails again, because session cookie is needed
        [res.http400badRequest, '{"error":"Must be logged in: No cookies"}'],
    ],

    // Logged in as a regular user.
    // TODO

    // Logged in as an admin.
    // TODO

    // Logged in as a superadmin.
    [
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, '{"password":"my_pass","username":"superadmin"}', `${req.origin}/log-in`],
        [
            res.http200ok,
            '< Set-Cookie: sessionCookieUsername=superadmin',
            '< Set-Cookie: sessionCookieUuid=12345678-abcd-cdef-1234-0123456789ab',
            {
                result: {
                    message: "'superadmin' successfully logged in",
                    sessionCookieExpires: "2024-05-29T18:26:52.345Z",
                    sessionCookieUsername: 'superadmin',
                    sessionCookieUuid: '12345678-abcd-cdef-1234-0123456789ab',
                }
            }
        ],
    ],
    [
        [`-v`, `${req.origin}/domains`], // without session cookie, even though we logged in
        [res.http400badRequest, res.jsonContentType, '{"error":"Must be logged in: No cookies"}'],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/`], // didn't need session cookie for `GET /`, but it's no problem
        [res.http200ok, '< Content-Type: text/plain; charset=utf-8', 'ok'],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/is-using-mock-db`], // same here
        [res.http200ok, '{"result":true}'],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/collections`], // superadmin session cookie gives access
        [res.http200ok, '{"result":["gus_daily_reports","gus_superadmins"]}'],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/collection/gus_superadmins`], // again, superadmin session cookie gives access
        [res.http200ok, {
            result: {
                superadmin: {
                    isSuperadmin: true,
                    pwHash: '2aa04e2e4fd0d86d5f4cf5063e671ec8',
                    pwSalt: 'my_salt',
                    isLoggedIn: true,
                    sessionCookieExpires: '2024-05-29T18:26:52.345Z',
                    sessionCookieUuid: '12345678-abcd-cdef-1234-0123456789ab'
                }
            }
        }],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/collection/gus_superadmins/superadmin`], // again, superadmin session cookie gives access
        [res.http200ok, {
            result: {
                isSuperadmin: true,
                pwHash: '2aa04e2e4fd0d86d5f4cf5063e671ec8',
                pwSalt: 'my_salt',
                isLoggedIn: true,
                sessionCookieExpires: '2024-05-29T18:26:52.345Z',
                sessionCookieUuid: '12345678-abcd-cdef-1234-0123456789ab'
            }
        }],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/domains`], // again, superadmin session cookie gives access
        [res.http200ok, '{"result":[]}'],
    ],
];
