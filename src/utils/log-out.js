export const logOut = async (
    userKit,
    { cookiesAsProps },
    res,
) => {
    const { userDocRef } = userKit;

    // Run basic validation on the data POSTed by the user.
    const tCAP = typeof cookiesAsProps;
    if (tCAP !== 'undefined' && tCAP !== 'boolean' && cookiesAsProps !== null) throw Error(
        'Invalid cookiesAsProps');

    // Mark the user as logged-out.
    await userDocRef.update({
        isLoggedIn: false,
        sessionCookieExpires: null,
        sessionCookieUuid: null,
    });

    // Get "superadmin" from the "gus_superadmins/superadmin" id.
    const username = userDocRef.id.split('/').pop();

    // If the request set `cookiesAsProps` to `true`, send `sessionCookieUuid`
    // and `sessionCookieUsername` as JSON properties, not in "Set-Cookie".
    if (cookiesAsProps) {
        return {
            message: `'${username}' successfully logged out`,
            sessionCookieUsername: 'logged-out',
            sessionCookieUuid: 'logged-out',
        };    
    }

    // Otherwise, `cookiesAsProps` is falsey, so send `sessionCookieUuid` and
    // `sessionCookieUsername` in "Set-Cookie", not as JSON properties.
    res.setHeader('Set-Cookie', [
        `sessionCookieUsername=logged-out; SameSite=None`,
        `sessionCookieUuid=logged-out; SameSite=None`,
    ]);
    return {
        message: `'${username}' successfully logged out`,
    };
};
