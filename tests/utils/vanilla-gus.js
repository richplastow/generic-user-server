import { GenericUserServer } from '../../index.js';
import { getMockFirestore } from '../../src/utils/get-mock-firestore.js';
import { mockGetNowDate } from '../../src/utils/mock-get-now-date.js';
import { MockTimestamp } from '../../src/utils/mock-timestamp.js';

const mockCollections = [
    {
        id: 'gus_daily_reports',
    },
    {
        id: 'gus_superadmins',
        superadmin: {
            isSuperadmin: true,
            pwHash: '2aa04e2e4fd0d86d5f4cf5063e671ec8',
            pwSalt: 'my_salt',
        },
    },
];

const vanillaGus = new GenericUserServer({
    customEndpoints: [],
    deps: {
        getNowDate: mockGetNowDate,
        randomUUID: () => '12345678-abcd-cdef-1234-0123456789ab',
        Timestamp: MockTimestamp,
    },
    domains: [],
    firestore: getMockFirestore(mockCollections),
    gusName: 'vanilla-gus',
    isExample: true,
});
await vanillaGus.initialise();
