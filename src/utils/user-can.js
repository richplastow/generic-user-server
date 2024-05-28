export const userCan = (user, minimally) => {
    switch (minimally) {
        case 'registered': return user !== null;
        case 'admin': return user.isAdmin || user.isSuperadmin;
        case 'superadmin': return user.isSuperadmin;
        case 'anon': return true;
    }
    throw Error(`Value of minimally "${minimally}" not recognised`);
};
