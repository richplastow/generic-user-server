/** ### `mockGetNowDate()`
 */
export const mockGetNowDate = hint => {
    switch (hint) {
        case 'constructedAt':
            return new Date(1717000000123); // 2024-05-29T16:26:40.123Z
        case 'initialisedAt':
            return new Date(1717000001234); // 2024-05-29T16:26:41.234Z
        case 'logIn_superadmin':
            return new Date(1717000012345); // 2024-05-29T16:26:52.345Z
        default:
            return new Date(1717000123456); // 2024-05-29T16:28:43.456Z
    }
};
