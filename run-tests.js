import { spawn, spawnSync } from 'node:child_process';

import { example1CurlTests } from './examples/example-1-tests.js';

let example1;
const example1Errors = [];
try {
    const example1 = spawn('node', ['examples/example-1.js']);

    example1.stdout.on('data', actual => {
        const acTrim = actual.toString().trim();
        const expected = 'example-1 listening on port 1234';
        if (acTrim !== expected) {
            example1Errors.push(`stdout "${acTrim}" not "${expected}"`);
        } else {
            example1CurlTests.forEach(([args, expectedResults]) => {
                const { stdout, stderr, status } = spawnSync('curl', args);
                if (status !== 0) {
                    example1Errors.push(`status ${status} not 0 for:\n    curl '${args.join("' '")}'`);
                    return; // skip to the next curl test
                }
                // curl may send its verbose output to stderr. Cover all bases
                // by concatenating stdout and stderr into out string.
                const allOutput = `${stderr}\n${stdout}`.split('\n').map(l => l.trim());
                expectedResults.forEach(expectedResult => {
                    const expTrim = expectedResult.trim();
                    if (!allOutput.includes(expTrim)) {
                        example1Errors.push(`Expected result "${expTrim
                            }" not found in stderr or stdout of:\n    curl '${args.join("' '")}'`);
                    }
                });
                // console.log('\n\n\n\n', args, ':\n');
                // console.log('allOutput:', allOutput, '\n\n');
            });    
        }

        example1.kill('SIGINT'); // equivalent to ctrl-c
    });
    
    example1.stderr.on('data', errorMessage => {
        example1Errors.push(`Unexpected stderr "${errorMessage}"`);
    });
    
    example1.on('close', code => {
        if (code !== null) {
            example1Errors.push(`code ${code} not null`);
        }
        showTestResults();
    });
    
} catch(err) {
    example1Errors.push(`Unexpected exception: "${err.message}"`);
    example1.kill('SIGINT'); // make sure the process stops, and free-up port 1234
    showTestResults();
}

function showTestResults() {
    if (example1Errors.length)
        console.error(`${example1Errors.length} error(s):\n`, example1Errors.join('\n'));
    else
        console.log('All tests passed');    
}
