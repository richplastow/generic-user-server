import { parseDelimitedData } from './parse-delimited-data.js';
import { usernameRx, uuidRx } from './regexps.js';

export const getUser = async (cookieRaw, firestore, userCollectionName) => {
    if (! cookieRaw) throw Error('No cookies');

    const parsedCookies = parseDelimitedData('; ', cookieRaw); // TODO deal with just ';'
    const { sessionCookieUsername, sessionCookieUuid } = parsedCookies;

    // Run basic validation on the user's cookie header.
    if (typeof sessionCookieUsername !== 'string') throw Error('No sessionCookieUsername');
    if (typeof sessionCookieUuid !== 'string') throw Error('No sessionCookieUuid');
    if (! usernameRx.test(sessionCookieUsername)) throw Error('Invalid sessionCookieUsername');
    if (! uuidRx.test(sessionCookieUuid)) throw Error('Invalid sessionCookieUuid');

    // Xx.
    const userDocRef = firestore.doc(`${userCollectionName}/${sessionCookieUsername}`);
    const userDoc = await userDocRef.get();
    if (! userDoc.exists) throw Error('No such sessionCookieUsername');

    // Xx.
    const user = userDoc.data();
    if (user.sessionCookieUuid !== sessionCookieUuid) throw Error('Incorrect sessionCookieUuid');
    return user;
};
