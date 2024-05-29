export const logOut = async (userKit) => {
    const { userDocRef } = userKit;

    // Mark the user as logged-out.
    await userDocRef.update({
        isLoggedIn: false,
        sessionCookieUuid: null,
    });

    // Get "superadmin" from the "gus_superadmins/superadmin" id.
    const username = userDocRef.id.split('/').pop();

    return {
        message: `'${username}' successfully logged out`,
    };
};
