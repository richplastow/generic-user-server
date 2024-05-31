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
        [
            `-v`, `-X`, `PUT`,
            `-H`, req.jsonContentType,
            `${req.origin}/collection/gus_superadmins/superadmin`
        ],
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
        [
            `-v`, `-X`, `POST`,
            `-H`, req.jsonContentType,
            `-d`, '{"password":"my_pass","username":"superadmin"}',
            `${req.origin}/log-in`
        ],
        [
            res.http200ok,
            '< Set-Cookie: sessionCookieUsername=superadmin; SameSite=None',
            '< Set-Cookie: sessionCookieUuid=12345678-abcd-cdef-1234-0123456789ab; SameSite=None',
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
        [
            `-v`, `-X`, `PUT`,
            `-H`, req.jsonContentType, `-H`, req.sessionSuperadmin,
            `-d`, JSON.stringify({
                nested: {
                    foo: '2024-05-29T18:26:52.345Z',
                    bar: { _seconds:1234567890, _nanoseconds: 123000000 }, // Firestore Timestamp format
                },
                baz: '2024-99-99T99:99:99.111Z', // invalid date is left
            }),
            `${req.origin}/collection/gus_superadmins/superadmin`
        ],
        [res.http200ok, '{"result":"ok"}'],
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
                sessionCookieUuid: '12345678-abcd-cdef-1234-0123456789ab',
                nested: {
                    foo: '2024-05-29T18:26:52.345Z',
                    bar: '2009-02-13T23:31:30.123Z', // was `{ _seconds:1234567890, _nanoseconds: 123000000 }`
                },
                baz: '2024-99-99T99:99:99.111Z', // invalid date is left as-is
            }
        }],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/domains`], // again, superadmin session cookie gives access
        [res.http200ok, '{"result":[]}'],
    ],
    [
        [
            `-v`, `-X`, `PUT`,
            `-H`, req.jsonContentType, `-H`, req.sessionSuperadmin,
            `-d`, `{"sessionCookieExpires":"2024-05-29T16:32:18.765Z"}`, // nearly 2 hours earlier than it originally was, which is in less than five minute's time
            `${req.origin}/collection/gus_superadmins/superadmin`
        ],
        [res.http200ok, '{"result":"ok"}'],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/collection/gus_superadmins/superadmin`], // again, superadmin session cookie gives access
        [res.http200ok, {
            result: {
                isSuperadmin: true,
                pwHash: '2aa04e2e4fd0d86d5f4cf5063e671ec8',
                pwSalt: 'my_salt',
                isLoggedIn: true,
                sessionCookieExpires: '2024-05-29T16:37:18.765Z', // GUS has added an extra 5 minutes grace period
                sessionCookieUuid: '12345678-abcd-cdef-1234-0123456789ab',
                nested: {
                    foo: '2024-05-29T18:26:52.345Z',
                    bar: '2009-02-13T23:31:30.123Z',
                },
                baz: '2024-99-99T99:99:99.111Z',
            }
        }],
    ],
    [
        [
            `-v`, `-X`, `PUT`,
            `-H`, req.jsonContentType, `-H`, req.sessionSuperadmin,
            `-d`, `{"sessionCookieExpires":"2024-05-29T16:26:52.345Z"}`, // 2 hours earlier than it originally was, which is in the past
            `${req.origin}/collection/gus_superadmins/superadmin`
        ],
        [res.http200ok, '{"result":"ok"}'],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/domains`], // fails, because session cookie expired
        [res.http400badRequest, '{"error":"Must be logged in: Expired sessionCookieExpiry"}'],
    ],
];
