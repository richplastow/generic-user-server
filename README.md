# generic-user-server

> A Node.js Express server which manages user auth and accounts for multiple domains at once.

- Created 20240522
- Rich Plastow
- <https://github.com/richplastow/generic-user-server>

Primarily intended to be run as an AWS App Runner instance, connected to an AWS
SimpleDb instance.

- A single GUS instance can serve multiple unrelated apps
- Handles user authentication and credentials
- Provides CRUD for user account/profile data
- Can send emails to confirm sign-up, or to reset passwords
- Provides CRUD for app-usage statistics
