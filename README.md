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

## Top-level endpoints

__`GET /`__

Responds with just two bytes, `ok`. All other endpoints use `application/json`
for their response `Content-Type`, but this endpoint uses `text/plain` instead.
Useful for AWS App Runner to 'ping' every 20 seconds, to show the app's running.

__`GET /collections`__

Responds with an array of collection names. Can only be accessed by superadmins.

__`GET /collections/:COLLECTION_NAME`__

Responds with the full contents of a collection, as a JSON object where document
IDs are keys, and documents are sub-objects. Can only be accessed by superadmins.

__`GET /domains`__

Responds with an array of domain names. Can only be accessed by superadmins.

__`GET /is-using-mock-db`__

Responds with `{"result":true}` if the object returned by `getMockFirestore()`
is being used. Responds with a 404 `{"error":"Not Found"}` if the real Firestore
SDK returned by `getFirestore()`. Can be accessed by anonymous users.

__`POST /log-in`__

Whereas `POST /foo/log-in` logs admins and regular users in to the ‘foo’ domain,
`POST /log-in` logs super-administrators into the generic-user-server instance.
This endpoint responds with `sessionCookieUsername` and `sessionCookieUuid` in
a JSON object, _and also_ as a `Set-Cookie` header.

__`POST /log-out`__

Whereas `POST /foo/log-out` logs admins and regular users in to the ‘foo’ domain,
`POST /log-in` logs super-administrators into the generic-user-server instance.
This endpoint revokes the `Set-Cookie` header created by `POST /log-in`. TODO

> __IMPORTANT:__ A live production server should __*never*__ use the mock
> firestore — it's only intended for testing and offline development.

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
curl -v -H 'Content-Type: application/json' -X POST -d '{"username":"superadmin","password":"my_pass"}' http://localhost:1234/log-in
# {"result":{"message":"'superadmin' successfully logged in","sessionCookieUsername":"superadmin","sessionCookieUuid":"de83dda3-afe7-48b8-8a27-251f2277d6db"}}
curl -v -H 'cookie: sessionCookieUsername=superadmin; sessionCookieUuid=de83dda3-afe7-48b8-8a27-251f2277d6db' http://localhost:1234/domains
# {"result":["tunefields"]}
```
