import { pbkdf2Sync } from 'node:crypto';
import { passwordRx, usernameRx } from './regexps.js';

export const logIn = async ({ randomUUID }, firestore, reqBody, userCollectionName) => {
    const { username, password } = reqBody;

    // Run basic validation on the data POSTed by the user.
    if (typeof username !== 'string' || ! usernameRx.test(username)) throw Error(
        'Invalid username');
    if (typeof password !== 'string' || ! passwordRx.test(password)) throw Error(
        'Invalid password');
    const userDocRef = firestore.doc(`${userCollectionName}/${username}`);
    const userDoc = await userDocRef.get();
    if (! userDoc.exists) throw Error('No such username');

    // TODO properly deal with a user logged in elsewhere
    const { isLoggedIn, pwHash, pwSalt, sessionCookieUuid } = userDoc.data();
    if (isLoggedIn) return {
        message: `'${username}' was already logged in`,
        sessionCookieUsername: username,
        sessionCookieUuid,
    };

    // Check that the password is correct.
    // Based on https://www.geeksforgeeks.org/node-js-password-hashing-crypto-module/.
    const postedPasswordHash = pbkdf2Sync(
        password,
        pwSalt,
        1000, // iterations
        16, // length of the hash in bytes (64 would be more secure)
        'sha512',
    ).toString('hex');
    if (postedPasswordHash !== pwHash) throw Error('Incorrect password')

    // Mark the user as logged-in.
    const newSessionCookieUuid = randomUUID();
    await userDocRef.update({
        isLoggedIn: true,
        sessionCookieUuid: newSessionCookieUuid,
    });

    return {
        message: `'${username}' successfully logged in`,
        sessionCookieUsername: username,
        sessionCookieUuid: newSessionCookieUuid,
    };
};
