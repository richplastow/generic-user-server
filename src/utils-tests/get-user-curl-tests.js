import {
    commonRequestLines as req,
    commonResponseLines as res,
} from '../../tests/utils/common-lines.js';

// Tells run-tests.js to run `node tests/utils/vanilla-gus.js` as a sub process.
export const getUserSubProcessPath = 'tests/utils/vanilla-gus.js';

export const getUserCurlTests = [
    [
        [`-v`, `${req.origin}/domains`],
        [res.http400badRequest, res.jsonContentType, '{"error":"Must be logged in: No cookies"}'],
    ],
    [
        [`-v`, `-H`, `cookie: foo=1; bar=2`, `${req.origin}/domains`],
        [res.http400badRequest, '< X-Powered-By: Express', '{"error":"Must be logged in: No sessionCookieUsername"}'],
    ],
    [
        [`-v`, `-H`, `cookie: sessionCookieUsername=1; bar=2`, `${req.origin}/domains`],
        [res.http400badRequest, '{"error":"Must be logged in: No sessionCookieUuid"}'],
    ],
    [
        [`-v`, `-H`, `cookie: sessionCookieUsername=1; sessionCookieUuid=2`, `${req.origin}/domains`],
        [res.http400badRequest, '{"error":"Must be logged in: Invalid sessionCookieUsername"}'],
    ],
    [
        [`-v`, `-H`, `cookie: sessionCookieUsername=superadmin; sessionCookieUuid=2`, `${req.origin}/domains`],
        [res.http400badRequest, '{"error":"Must be logged in: Invalid sessionCookieUuid"}'],
    ],
    [
        [`-v`, `-H`, `cookie: sessionCookieUsername=nope; sessionCookieUuid=12345678-abcd-cdef-1234-0123456789ab`, `${req.origin}/domains`],
        [res.http400badRequest, '{"error":"Must be logged in: No such sessionCookieUsername"}'],
    ],
    [
        [`-v`, `-H`, `cookie: sessionCookieUsername=superadmin; sessionCookieUuid=f287766b-09ed-4353-bb42-3c0adbcc5af6`, `${req.origin}/domains`],
        [res.http400badRequest, '{"error":"Must be logged in: Incorrect sessionCookieUuid"}'],
    ],
    [
        [`-v`, `-H`, req.jsonContentType, `-X`, `POST`, `-d`, '{"username":"superadmin","password":"my_pass"}', `${req.origin}/log-in`],
        [res.http200ok, {result:{
            message: "'superadmin' successfully logged in",
            sessionCookieUsername: "superadmin",
            sessionCookieUuid: "12345678-abcd-cdef-1234-0123456789ab",
        }}],
    ],
    [
        [`-v`, `-H`, req.sessionSuperadmin, `${req.origin}/domains`],
        [res.http200ok, '{"result":[]}'],
    ],
];
