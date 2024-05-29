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
        [`-v`, `${req.origin}/domains`], // fails again, because session cookie is needed
        [res.http400badRequest, '{"error":"Must be logged in: No cookies"}'],
    ],

    // Logged in as a regular user, also cannot access `GET /domains`.
    // TODO

    // Logged in as an admin, still cannot access `GET /domains`.
    // TODO

    // Logged in as a superadmin, can access `GET /domains`.
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
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/domains`], // again, superadmin session cookie gives access
        [res.http200ok, '{"result":[]}'],
    ],
];
