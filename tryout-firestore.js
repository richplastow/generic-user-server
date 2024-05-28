// Based on:
// <https://www.npmjs.com/package/@google-cloud/firestore#using-the-client-library>
// <https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/firestore#examples>

import { getFirestore } from './src/utils/get-firestore.js';

async function tryoutFirestore(firestore) {
    // Obtain a document reference.
    // <https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/documentreference>
    const document = firestore.doc('gus_daily_reports/example');

    // Enter new data into the document.
    // await document.set({
    //     title: 'Welcome to Firestore',
    //     body: 'Hello World',
    // });
    // console.log('Entered new data into the document');

    // Update an existing document.
    // await document.update({
    //     body: 'My first Firestore app',
    // });
    // console.log('Updated an existing document');

    // Obtain a document snapshot.
    // "... an immutable representation for a document in a Firestore database".
    // <https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/documentsnapshot>
    // <https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/timestamp>
    const doc = await document.get();

    if (!doc.exists) {
        console.error('No such document!');
        return;
    }

    // Use properties.
    const { createTime, id, updateTime } = doc;
    console.log(`createTime: '${new Date(createTime.toMillis()).toISOString()}'`);
    console.log(`id: '${id}'`);
    console.log(`updateTime: '${new Date(updateTime.toMillis()).toISOString()}'`);

    // Use methods.
    console.log(`data(): '${JSON.stringify(doc.data())}'`);
    console.log(`doc.get('isExample'): ${doc.get('isExample')}`);
}


// Create a new Firestore client.
const firestore = getFirestore();

tryoutFirestore(firestore);
