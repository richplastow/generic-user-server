import {
    commonRequestLines as req,
    commonResponseLines as res,
} from './utils/common-lines.js';

// Tells run-tests.js to run `node examples/example-1.js` as a sub process.
export const topLevelSubProcessPath = 'tests/utils/vanilla-gus.js';

export const topLevelCurlTests = [
    [
        [`-v`, `${req.origin}/`],
        [res.http200ok, '< Content-Type: text/plain; charset=utf-8', 'ok'],
    ],
];
