# Step 1: Install NPM packages

[^ Notes](./00-notes.md)

## Express

Express is a standard Node.js server framework. We'll only need a small subset
of its features.

```bash
npm i express
# added 64 packages, and audited 65 packages in 2s
# 12 packages are looking for funding
#   run `npm fund` for details
# found 0 vulnerabilities
```

This creates node_modules/ - 2,141,229 bytes (3.6 MB on disk) for 557 items.

## Nodemailer

Used for sending emails to confirm sign-up, or to reset passwords.

```bash
npm i nodemailer
# added 1 package, and audited 66 packages in 815ms
# 12 packages are looking for funding
#   run `npm fund` for details
# found 0 vulnerabilities
```

node_modules/ is now 2,749,250 bytes (4.3 MB on disk) for 619 items.

## jsonwebtoken

An implementation of JSON Web Tokens, a modern standard for user authentication.

```bash
npm i jsonwebtoken
# added 14 packages, and audited 80 packages in 1s
# 12 packages are looking for funding
#   run `npm fund` for details
# found 0 vulnerabilities
```

node_modules/ is now 3,071,766 bytes (5 MB on disk) for 769 items.

## firebase

AWS SDK for JavaScript DynamoDB Client for Node.js, Browser and React Native.

```bash
npm i firebase
# added 85 packages, and audited 165 packages in 22s
# 14 packages are looking for funding
#   run `npm fund` for details
# found 0 vulnerabilities
```

node_modules/ is now 115,370,269 bytes (146.3 MB on disk) for 13,596 items.

> Note that `npm i @aws-sdk/client-dynamodb` would have been considerably
> smaller: 9,505,094 bytes (22.1 MB on disk) for 4,711 items.

