export const userCan = (minimally, userKit) => {
    // If no user has been retrieved from the database, only 'anon' endpoints
    // are allowed to be run.
    if (userKit === null) return minimally === 'anon';

    // 
    switch (minimally) {
        case 'registered': return userKit !== null;
        case 'admin': return userKit.userData.isAdmin || userKit.userData.isSuperadmin;
        case 'superadmin': return userKit.userData.isSuperadmin;
        case 'anon': return true;
    }

    throw Error(`Value of minimally "${minimally}" not recognised`);
};
