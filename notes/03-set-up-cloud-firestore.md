# Step 3: Set up Cloud Firestore

[^ Notes](./00-notes.md)

## What is Firestore?

From <https://firebase.google.com/products/firestore>

> _"Cloud Firestore is a NoSQL document database that lets you easily store,_
> _sync, and query data for your mobile and web apps - at global scale._

It will probably supersede Google's older Realtime Database soon.

<https://firebase.google.com/docs/firestore>

## Generate a hash from a salt and a password

Here's how I created the `pwHash` value for the GUS top-level superadmin, using
the salt "my_salt" and (very insecure) password "my_pass". You should make your
own `pwHash`, based on a more hard-to-guess salt and password.

```bash
node -e "console.log(require('crypto').pbkdf2Sync('my_pass','my_salt',1000,16,'sha512').toString('hex'))"
# 2aa04e2e4fd0d86d5f4cf5063e671ec8
```

## Create a Firestore database, collection and document

To instantiate without throwing exceptions, GenericUserServer needs collections
named `gus_daily_reports` and `gus_superadmins` to exist in the database.

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
- Collection ID: `gus_daily_reports`
- Click ‘Next’
- Document ID: `about`
- Field: `description`
- Type: `string`
- Value: `Contains about 50 server reports`
- Click ‘Save’
- Repeat the process to create the `gus_superadmins` collection
- Document ID: `superadmin` (or choose a harder-to-guess username)
- Field, Type, Value: `isLoggedIn`, `boolean`, `true`
- Field, Type, Value: `pwHash`, `string`, `2aa04e2e4fd0d86d5f4cf5063e671ec8`
- Field, Type, Value: `pwSalt`, `string`, `my_salt`
- Click ‘Save’
- Click the ‘Rules’ tab
- __IMPORTANT:__ Change `if false;` to `if request.auth != null;`

## Create a service account to use the database, and get its key JSON file

From <https://firebase.google.com/docs/firestore/query-data/get-data>, clicking
on the ‘Node.js’ tab of ‘Initialize Cloud Firestore’, and scrolling to
‘Initialize on your own server’:

> _To use the Firebase Admin SDK on your own server (or any other Node.js_
> _environment), use a service account. Go to IAM & admin > Service accounts in_
> _the Google Cloud console. Generate a new private key and save the JSON file._
> _Then use the file to initialize the SDK:_

__I could not get the sample code to work - see below for a working version.__

Visit <https://console.cloud.google.com/iam-admin/serviceaccounts>, choose
your country, tick the ‘Terms of Service’ and ‘Email updates’ checkboxes, and
click ‘AGREE AND CONTINUE’.

Click the ‘Select a project’ dropdown at the top left, and choose the
`generic-user-server` project. You should see two service accounts in the table
already, ‘firebase-adminsdk’ and ‘GitHub Actions (GH_USER/generic-user-server)’.

Click ‘+ CREATE SERVICE ACCOUNT’ at the top of the page.

- Service account name: `Generic User Server NodeJS Client`
- Service account ID: `gus-nodejs-client`
- Service account description:
  `Firestore read and write, for the generic-user-server project`
- Click ‘CREATE AND CONTINUE’
- Click ‘Select a role’ and type "datastore.user" into the filter
- Click Cloud Datastore User’ and click ‘CONTINUE’ (no need for an IAM
  condition or another role) For a full list of Firebase roles, visit
  <https://cloud.google.com/firestore/docs/security/iam>
- Click ‘DONE’ (no need to grant users access to this service account)
- You should see the new service account in the table
- Click on its ‘Email’ link
- Click the ‘KEYS’ tab, click ‘ADD KEY’ and ‘Create new key’
- Keep ‘JSON’ selected, and click ‘CREATE’
- You should see a ‘Private key saved to your computer’ popup, and find a JSON
  file named something like generic-user-server-abcdef123456.json downloaded to
  your browser's default ‘Downloads’ folder
- Move that JSON file to the root of the `generic-user-server` repo
- Add its filename to .gitignore so that it doesn't accidentally get published
  or distributed if the repo origin is forked or made public

## Read the database using a Node.js app running on your local machine

Read through and understand the tryout-firestore.js script. It's quite well
commented! This lets you check that the Firestore database and your JSON key are
working as expected.

Use this node one-liner to minify the JSON key downloaded above (replace
'abcdef123456' to match your key's filename):

```bash
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('generic-user-server-abcdef123456.json')+'')))"
# {"type":"service_account","project_id":"generic-user-server","private_key_id":
# ...
# ,"universe_domain":"googleapis.com"}
```

Copy the minified JSON between `{"type":"se ...` and `ain":"googleapis.com"}`.
It has no newlines, which will make it easier to use as an environment variable.

```bash
GUS_FIRESTORE_JSON_KEY='{"type":"servi ... eapis.com"}' node tryout-firestore.js
# createTime: '2024-05-26T19:56:21.286Z'
# id: 'example'
# updateTime: '2024-05-26T19:56:21.286Z'
# data(): '{"isExample":true}'
# doc.get('isExample'): true
```
