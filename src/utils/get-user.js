import { parseDelimitedData } from './parse-delimited-data.js';
import { usernameRx, uuidRx } from './regexps.js';

export const getUser = async ({ getNowDate, Timestamp }, cookieRaw, firestore, userCollectionName) => {
    if (! cookieRaw) throw Error(`No cookies`);

    const parsedCookies = parseDelimitedData('; ', cookieRaw); // TODO deal with just ';'
    const { sessionCookieUsername, sessionCookieUuid } = parsedCookies;

    // Run basic validation on the user's 'Cookie' header.
    if (typeof sessionCookieUsername !== 'string') throw Error(`No sessionCookieUsername`);
    if (typeof sessionCookieUuid !== 'string') throw Error(`No sessionCookieUuid`);
    if (! usernameRx.test(sessionCookieUsername)) throw Error(`Invalid sessionCookieUsername`);
    if (! uuidRx.test(sessionCookieUuid)) throw Error(`Invalid sessionCookieUuid`);

    // Try to get a handle on the user document, and retrieve the user data.
    const userDocRef = firestore.doc(`${userCollectionName}/${sessionCookieUsername}`);
    const userDoc = await userDocRef.get();
    if (! userDoc.exists) throw Error(`No such sessionCookieUsername`);
    const userData = userDoc.data();
    if (userData.sessionCookieUuid !== sessionCookieUuid) throw Error(`Incorrect sessionCookieUuid`);

    // Check how much time remains, before the user's session expires.
    const nowDate = getNowDate(`getUser_${sessionCookieUsername}`);
    const nowMillis = nowDate.valueOf();
    const expiresMillis = userData.sessionCookieExpires.toMillis();
    const remainingMinutes = (expiresMillis - nowMillis) / (60 * 1000);

    // If the session has expired, mark the user as logged-out.
    if (remainingMinutes <= 0) {
        await userDocRef.update({
            isLoggedIn: false,
            sessionCookieExpires: null,
            sessionCookieUuid: null,
        });
        throw Error(`Expired sessionCookieExpiry`);
    }

    // If the session's nearly expired, give the user an extra 5 minutes grace period.
    // TODO maybe this should not be able to continue indefinitely?
    if (remainingMinutes <= 5) {
        const expiresPlusGracePeriodMillis = expiresMillis + 5 * 60 * 1000;
        await userDocRef.update({
            sessionCookieExpires: Timestamp.fromMillis(expiresPlusGracePeriodMillis),
        });
    }

    return { nowDate, nowMillis, userData, userDoc, userDocRef };
};
