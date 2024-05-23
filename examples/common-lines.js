export const commonRequestLines = {
    jsonContentType: 'Content-Type: application/json',
    origin: 'http://localhost:1234',
};

export const commonResponseLines = {
    http200ok: '< HTTP/1.1 200 OK',
    http404notFound: '< HTTP/1.1 404 Not Found',
    jsonContentType: '< Content-Type: application/json; charset=utf-8',
};
