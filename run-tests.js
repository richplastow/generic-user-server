import { spawn, spawnSync } from 'node:child_process';

import { example1CurlTests, example1SubProcessPath } from './examples/example-1-curl-tests.js';
import { getUserCurlTests, getUserSubProcessPath } from './src/utils-tests/get-user-curl-tests.js';
import { logInCurlTests, logInSubProcessPath } from './src/utils-tests/log-in-curl-tests.js';
import { topLevelCurlTests, topLevelSubProcessPath } from './tests/top-level-curl-tests.js';

const testSuites = [
    [ 'example-1', 'example-1', example1CurlTests, example1SubProcessPath ],
    [ 'getUser()', 'vanilla-gus', getUserCurlTests, getUserSubProcessPath ],
    [ 'logIn()', 'vanilla-gus', logInCurlTests, logInSubProcessPath ],
    [ 'top-level', 'vanilla-gus', topLevelCurlTests, topLevelSubProcessPath ],
];

let subProcess;
let errors = [];

const slowResolvingCurlTest = async testSuite => new Promise((resolve, reject) => {
    const [ testSuiteName, gusName, curlTests, subProcessPath ] = testSuite;

    try {
        // Note that these tests do not specify a GUS_FIRESTORE_JSON_KEY environment
        // variable, so 'example-1.js' will use `getMockFirestore(mockCollections)`.
        subProcess = spawn('node', [subProcessPath]);

        subProcess.stdout.on('data', actual => {
            const acTrim = actual.toString().trim();
            const expected = `GUS ${gusName}, DB gus-mock-firestore, PORT 1234`;
            if (acTrim !== expected) {
                errors.push(`${testSuiteName}: stdout "${acTrim}" not "${expected}"`);
            } else {
                curlTests.forEach(([args, expectedResults]) => {
                    const { stdout, stderr, status } = spawnSync('curl', args);
                    if (status !== 0) {
                        errors.push(`${testSuiteName}: status ${status
                            } not 0 for:\n    curl '${args.join("' '")}'`);
                        return; // skip to the next curl test
                    }
                    // curl may send its verbose output to stderr. Cover all bases
                    // by concatenating stdout and stderr into out string.
                    const allOutput = `${stderr}\n${stdout}`.split('\n').map(l => l.trim());
                    expectedResults.forEach(expectedResult => {
                        if (expectedResult instanceof RegExp) {
                            if (!allOutput.some(line => expectedResult.test(line))) {
                                errors.push(`${testSuiteName}: Expected ${expectedResult
                                    } to pass a stderr or stdout line of:\n    curl '${args.join("' '")}'`);
                                console.log('\n\n\n\n', args, ':\n');
                                console.log('allOutput:', allOutput, '\n\n');
                            }    
                        } else {
                            const expectedStr = typeof expectedResult === 'object'
                                ? JSON.stringify(expectedResult) : expectedResult.trim();
                            if (!allOutput.includes(expectedStr)) {
                                errors.push(`${testSuiteName}: Expected result "${expectedStr
                                    }" not found in stderr or stdout of:\n    curl '${args.join("' '")}'`);
                                console.log('\n\n\n\n', args, ':\n');
                                console.log('allOutput:', allOutput, '\n\n');
                            }    
                        }
                    });
                });    
            }
            subProcess.kill('SIGINT'); // equivalent to ctrl-c
        });

        subProcess.stderr.on('data', errorMessage => {
            errors.push(`${testSuiteName}: Unexpected stderr "${errorMessage}"`);
        });

        subProcess.on('close', code => {
            if (code !== null) {
                errors.push(`${testSuiteName}: code ${code} not null`);
            }
            showTestResults(testSuiteName, resolve);
        });

    } catch(err) {
        errors.push(`${testSuiteName}: Unexpected exception: "${err.message}"`);
        subProcess.kill('SIGINT'); // make sure the process stops, and free-up port 1234
        showTestResults(testSuiteName, reject);
    }
});


// Run each test suite, one after another.
// By the way, `testSuites.forEach()` would not be able to wait for each test
// suite to complete, like `for (const testSuite of testSuites) { ... }` can.
for (const testSuite of testSuites) {
    const startTime = new Date().valueOf();
    const testSuiteName = testSuite[0];
    console.log(`${testSuiteName}: Starting test suite`);
    await slowResolvingCurlTest(testSuite);
    const duration = new Date() - startTime;
    console.log(`${testSuiteName}: Completed after ${duration}ms\n`);
};

function showTestResults(testSuiteName, resolveOrReject) {
    if (errors.length) {
        console.error(`${testSuiteName}: ${errors.length} error(s):\n` + errors.join('\n'));
    } else {
        console.log(`${testSuiteName}: All tests passed`);    
    }
    errors = [];
    resolveOrReject();
}
