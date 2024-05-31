import { pbkdf2Sync } from 'node:crypto';
import { passwordRx, usernameRx } from './regexps.js';
import { getFutureDate } from './get-future-date.js';

export const logIn = async ({ getNowDate, randomUUID, Timestamp }, firestore, reqBody, userCollectionName) => {
    const { for1Week, password, username } = reqBody;

    // Run basic validation on the data POSTed by the user.
    const tCAP = typeof cookiesAsProps;
    if (tCAP !== 'undefined' && tCAP !== 'boolean' && cookiesAsProps !== null) throw Error(
        'Invalid cookiesAsProps'); // TODO NEXT cookiesAsProps, which should default to false for security
    const tF1W = typeof for1Week;
    if (tF1W !== 'undefined' && tF1W !== 'boolean' && for1Week !== null) throw Error(
        'Invalid for1Week');
    if (typeof password !== 'string' || ! passwordRx.test(password)) throw Error(
        'Invalid password');
    if (typeof username !== 'string' || ! usernameRx.test(username)) throw Error(
        'Invalid username');
    const userDocRef = firestore.doc(`${userCollectionName}/${username}`);
    const userDoc = await userDocRef.get();
    if (! userDoc.exists) throw Error('No such username');

    // TODO properly deal with a user logged in elsewhere
    const { isLoggedIn, pwHash, pwSalt, sessionCookieExpires, sessionCookieUuid } = userDoc.data();
    if (isLoggedIn) return {
        message: `'${username}' was already logged in`,
        sessionCookieExpires,
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

    // Get the expiry timestamp, in Firestore-friendly and JSON-friendly formats.
    const nowDate = getNowDate(`logIn_${username}`);
    const expiryDate = getFutureDate(nowDate, for1Week ? '1_WEEK' : '2_HOURS');
    const expiryFirestore = Timestamp.fromDate(expiryDate);
    const expiryJson = expiryDate.toISOString();

    // Mark the user as logged-in.
    const newSessionCookieUuid = randomUUID();
    await userDocRef.update({
        isLoggedIn: true,
        sessionCookieExpires: expiryFirestore,
        sessionCookieUuid: newSessionCookieUuid,
    });

    return {
        message: `'${username}' successfully logged in`,
        sessionCookieExpires: expiryJson,
        sessionCookieUsername: username,
        sessionCookieUuid: newSessionCookieUuid,
    };
};
