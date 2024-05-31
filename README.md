# GenericUserServer

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

## Endpoints

### Anonymous, top-level endpoints

__`GET /`__

Responds with just two bytes, `ok`. All other endpoints use `application/json`
for their response `Content-Type`, but this endpoint uses `text/plain` instead.
Useful for AWS App Runner to 'ping' every 20 seconds, to show the app's running.

__`GET /is-using-mock-db`__

Responds with `{"result":true}` if the object returned by `getMockFirestore()`
is being used. Responds with a 404 `{"error":"Not Found"}` if the real Firestore
SDK returned by `getFirestore()`. Can be accessed by anonymous users.

> __IMPORTANT:__ A live production server should __*never*__ use the mock
> firestore — it's only intended for testing and offline development.

### Superuser session management

__`POST /log-in`__

Whereas `POST /foo/log-in` logs admins and regular users in to the ‘foo’ domain,
`POST /log-in` logs super-administrators into the generic-user-server instance.
This endpoint responds with `sessionCookieExpires`, `sessionCookieUsername` and
`sessionCookieUuid` in a JSON object. This endpoint _also_ responds with the
`sessionCookieUsername` and `sessionCookieUuid` in a `Set-Cookie` header - note
that the `Expires` attribute is not set, so the cookie will be discarded when
the user ends their session.

__`POST /log-out`__

Whereas `POST /foo/log-out` logs admins and regular users in to the ‘foo’ domain,
`POST /log-in` logs super-administrators into the generic-user-server instance.
This endpoint changes `sessionCookieExpires` and `sessionCookieUuid` in the DB
to `null`. It's not possible to revoke the `Set-Cookie` header, though it can be
overwritten by a successful log-in later on. TODO maybe Set-Cookie to null?

### Endpoints for superusers to read server settings

__`GET /domains`__

Responds with an array of domain names. Can only be accessed by superadmins.

### Endpoints for superusers to query and edit the database

__`GET /collections`__

Responds with an array of collection names. Can only be accessed by superadmins.

__`GET /collections/:COLLECTION_NAME`__

Responds with the full contents of a collection, as a JSON object where document
IDs are keys, and documents are sub-objects. Can only be accessed by superadmins.

__`GET /collections/:COLLECTION_NAME/:DOCUMENT_ID`__

Responds with the full contents of a document as a JSON object. Can only be
accessed by superadmins.

__`PUT /collections/:COLLECTION_NAME/:DOCUMENT_ID`__

The request body should be a JSON object with the properties which need updating.
If a property is omitted, it will remain the same in the database. Strings in
the form `2024-05-29T18:26:52.345Z` are converted to `Timestamp` instances.
Objects in the form `{"_seconds":123,"_nanoseconds":456}` are also converted to
`Timestamp` instances. Responds with `{"result":"ok"}` if the update succeeded.

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
# {"error":"Not Found"}
```

That result means that a real Firestore database is being used.

```bash
curl -v -H 'Content-Type: application/json' -X POST -d '{"for1Week":true,"password":"my_pass","username":"superadmin"}' http://localhost:1234/log-in
# {"result":{"message":"'superadmin' successfully logged in","sessionCookieExpires":"2024-06-05T16:26:52.345Z","sessionCookieUsername":"superadmin","sessionCookieUuid":"de83dda3-afe7-48b8-8a27-251f2277d6db"}}
curl -v -H 'cookie: sessionCookieUsername=superadmin; sessionCookieUuid=de83dda3-afe7-48b8-8a27-251f2277d6db' http://localhost:1234/domains
# {"result":["tunefields"]}
```
