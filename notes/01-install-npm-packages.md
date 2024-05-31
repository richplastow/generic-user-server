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

node_modules/ is now 3,149,614 bytes (5.1 MB on disk) for 779 items

## @google-cloud/firestore

```bash
npm i @google-cloud/firestore
# added 95 packages, and audited 175 packages in 11s
# 18 packages are looking for funding
#   run `npm fund` for details
# found 0 vulnerabilities
```

node_modules/ is now 22,794,900 bytes (29.7 MB on disk) for 2,988 items

> Note that `npm i firebase` or `npm i firebase-admin` would both have been
> bigger, at ~140 MB and ~28 MB respectively.

## cors

```bash
npm i cors
# added 2 packages, and audited 177 packages in 2s
# 18 packages are looking for funding
#   run `npm fund` for details
# found 0 vulnerabilities
```

node_modules/ is now 22,833,392 bytes (29.8 MB on disk) for 3,001 items
