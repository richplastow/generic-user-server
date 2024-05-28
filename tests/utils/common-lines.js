export const commonRequestLines = {
    jsonContentType: 'Content-Type: application/json',
    origin: 'http://localhost:1234',
    sessionSuperadmin: 'cookie: sessionCookieUsername=superadmin; sessionCookieUuid=12345678-abcd-cdef-1234-0123456789ab',
};

export const commonResponseLines = {
    http200ok: '< HTTP/1.1 200 OK',
    http400badRequest: '< HTTP/1.1 400 Bad Request',
    http404notFound: '< HTTP/1.1 404 Not Found',
    jsonContentType: '< Content-Type: application/json; charset=utf-8',
};
