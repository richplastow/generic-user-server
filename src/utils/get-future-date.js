/** ### `getFutureDate()`
 */
export const getFutureDate = (dateNow, delay) => {
    switch (delay) {
        case '1_WEEK':
            return new Date(dateNow.valueOf() + 7 * 24 * 60 * 60 * 1000);
        case '2_HOURS':
            return new Date(dateNow.valueOf() + 2 * 60 * 60 * 1000);
        default:
            throw Error("`delay` not '1_WEEK' or '2_HOURS'");
    }
};
