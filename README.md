# generic-user-server

> A Node.js Express server which manages user auth and accounts for multiple domains at once.

- Created 20240522
- Rich Plastow
- <https://github.com/richplastow/generic-user-server>

Primarily intended to be run as an AWS App Runner instance, connected to
a Google Firestore database.

- A single GUS instance can serve multiple unrelated apps
- Handles user authentication and credentials
- Provides CRUD for user account/profile data
- Can send emails to confirm sign-up, or to reset passwords
- Provides CRUD for app-usage statistics

## Running the examples

The simple way to run the examples is:

```bash
node examples/example-1.js
# GUS example-1, DB mock, PORT 1234
```

...and then in another terminal window:

```bash
curl http://localhost:1234/is-using-mock-db
# {"result":true}
```

That uses a mock of the Firestore database, plus some mock data.

The examples can also be run using a real Firestore database. Read the notes in
[Set up Cloud Firestore](./notes/03-set-up-cloud-firestore.md) first. It
describes a Node one-liner that will give you the minified JSON key:

```bash
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('generic-user-server-abcdef123456.json')+'')))"
# {"type":"service_account","project_id":"generic-user-server","private_key_id":
# ...
# ,"universe_domain":"googleapis.com"}
```

Copy the minified JSON between `{"type":"se ...` and `ain":"googleapis.com"}`.
It has no newlines, which will make it easier to use as an environment variable.

```bash
GUS_FIRESTORE_JSON_KEY='{"type":"servi ... eapis.com"}' node examples/example-1.js
# GUS example-1, DB (default), PORT 1234
```

...and then, as before, in another terminal window:

```bash
curl http://localhost:1234/is-using-mock-db
# {"result":false}
```
