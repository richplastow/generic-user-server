# Step 2: Set up Cloud Firestore

[^ Notes](./00-notes.md)

## What is Firestore?

From <https://firebase.google.com/products/firestore>

> _"Cloud Firestore is a NoSQL document database that lets you easily store,_
> _sync, and query data for your mobile and web apps - at global scale._

It will probably supersede Google's older Realtime Database soon.

<https://firebase.google.com/docs/firestore>

## Generate a salt, and an MD4 hash of a password

On MacOS:

```bash
echo "my_pass+my_salt" | openssl sha1
6c675ef13bf25dcdfe96d560265fa1b01417ed95
```

## Create a Firestore database, collection and document

Visit <https://console.firebase.google.com/project/generic-user-server/> and
click ‘All products’ in the sidebar, bottom left. Click ‘Cloud Firestore’ and
click ‘Create database’.

- Database ID: `(Default)` (cannot change this)
- Location: `europe-west3 (Frankfurt)`
- Click ‘Next’
- Keep ‘Start in production mode’ selected, and click ‘Create’
- After a few seconds, you should see the ‘Cloud Firestore’ console
- Click ‘+ Start Collection’
- Parent path: `/` (cannot change this)
- Collection ID: `users`
- Click ‘Next’
- Document ID: `admin`
- Field: `pwSha1`
- Type: `string`
- Value: `6c675ef13bf25dcdfe96d560265fa1b01417ed95`
- Click ‘+ Add field’
- Field: `pwSalt`
- Type: `string`
- Value: `my_salt`
- Click ‘Save’

## Create a service account to use the database, and get its key JSON file

From <https://firebase.google.com/docs/firestore/query-data/get-data>, clicking
on the ‘Node.js’ tab of ‘Initialize Cloud Firestore’, and scrolling to
‘Initialize on your own server’:

> _To use the Firebase Admin SDK on your own server (or any other Node.js_
> _environment), use a service account. Go to IAM & admin > Service accounts in_
> _the Google Cloud console. Generate a new private key and save the JSON file._
> _Then use the file to initialize the SDK:_

```js
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const serviceAccount = require('./path/to/serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
```

Visit <https://console.cloud.google.com/iam-admin/serviceaccounts>, choose
your country, tick the ‘Terms of Service’ and ‘Email updates’ checkboxes, and
click ‘AGREE AND CONTINUE’.

Click the ‘Select a project’ dropdown at the top left, and choose the
`generic-user-server` project. You should see two service accounts in the table
already, ‘firebase-adminsdk’ and ‘GitHub Actions (GH_USER/generic-user-server)’.

Click ‘+ CREATE SERVICE ACCOUNT’ at the top of the page.

- Service account name: `Generic User Server NodeJS Client`
- Service account ID: `gus-nodejs-client`
- Service account description: `Access the generic-user-server project Firestore`
- Click ‘CREATE AND CONTINUE’
- Click ‘Select a role’ and type "Firestore" into the filter
- Click ‘Firestore Service Agent’ and click ‘CONTINUE’ (no need for an IAM
  condition or another role) __TODO__ I actually added Firestore admin !!!!
- Click ‘DONE’ (no need to grant users access to this service account)
- You should see the new service account in the table
- Click on its ‘Email’ link, and click the ‘Keys’ tab
- Click ‘ADD KEY’ and ‘Create new key’
- Keep ‘JSON’ selected, and click ‘CREATE’
- You should see a ‘Private key saved to your computer’ popup, and find a JSON
  file named generic-user-server-abcdef123456.json downloaded to your browser's
  default ‘Downloads’ folder
- Move that JSON file to the root of the `generic-user-server` repo
- Add its filename to .gitignore so that it doesn't accidentally get published
  or distributed if the repo origin is forked or made public

## Read the database using a Node.js app running on your local machine

Create a file called firestore-tryout.js and paste in:

```js
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import serviceAccount from './generic-user-server-b1e5cdda35e0.json' assert { type: 'json' };

initializeApp(serviceAccount);

const db = getFirestore();

const adminUserRef = db.collection('users').doc('admin');
const doc = await adminUserRef.get();
if (!doc.exists) {
  console.log('No such document!');
} else {
  console.log('Document data:', doc.data());
}
```

```bash
GOOGLE_APPLICATION_CREDENTIALS="generic-user-server-b1e5cdda35e0.json" node firestore-tryout.js
# (node:78680) ExperimentalWarning: Import assertions are not a stable feature of the JavaScript ...
# (Use `node --trace-warnings ...` to show where the warning was created)
# (node:78680) ExperimentalWarning: Importing JSON modules is an experimental feature and might change at any time
# Document data: {
#   pwSha1: '6c675ef13bf25dcdfe96d560265fa1b01417ed95',
#   pwSalt: 'my_salt'
# }
```