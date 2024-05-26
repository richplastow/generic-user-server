import { writeFileSync, rmSync } from 'node:fs';
import { Firestore } from '@google-cloud/firestore';

/** ### `getFirestore()`
 *
 * Instantiates and returns a new Firestore client, based on the
 * `GUS_FIRESTORE_JSON_KEY` environment variable.
 *
 * @return {Firestore}
 */
export const getFirestore = () => {

    // Read and validate the JSON Firestore key from an environment variable.
    const { GUS_FIRESTORE_JSON_KEY } = process.env;
    if (!GUS_FIRESTORE_JSON_KEY) throw Error(`No process.env.GUS_FIRESTORE_JSON_KEY`);
    let parsedJson;
    try { parsedJson = JSON.parse(GUS_FIRESTORE_JSON_KEY) } catch(err) { throw Error(
        `Cannot parse process.env.GUS_FIRESTORE_JSON_KEY: ${err.message}`)}
    [   'type', 'project_id', 'private_key_id', 'private_key', 'client_email',
        'client_id', 'auth_uri', 'token_uri', 'auth_provider_x509_cert_url',
        'client_x509_cert_url', 'universe_domain',
    ].forEach(key => { if (typeof parsedJson[key] !== 'string') throw Error(
        `process.env.GUS_FIRESTORE_JSON_KEY.${key} is type '${typeof parsedJson[key]}' not 'string'`)})

    // Write the JSON Firestore key to disk, ready for `new Firestore({ ... })`.
    // This little dance is necessary, because there's no obvious way to just pass
    // the key JSON directly into `new Firestore()`. I got as far as these docs:
    // <https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#creating-the-client-instance>
    // ...but didn't delve in very deep.
    const randomString = Math.random().toString(36).slice(2);
    const randomFilename = `tmp_GUS_FIRESTORE_JSON_KEY_${randomString}.json`;
    try { writeFileSync(randomFilename, GUS_FIRESTORE_JSON_KEY) } catch(err) { throw Error(
        `Cannot write temporary file: ${err.message}`)}

    // Create a new Firestore client.
    const firestore = new Firestore({
        projectId: parsedJson.project_id, // not sure if this is really needed
        keyFilename: randomFilename,
    });

    // Clean up the temporary file, after a short delay.
    setTimeout(() => rmSync(randomFilename), 200);

    return firestore;
};
