import { GenericUserServer } from '../../index.js';
import { getMockFirestore } from '../../src/utils/get-mock-firestore.js';

const mockCollections = [
    {
        id: 'gus_insts_daily',
    },
];

const vanillaGus = new GenericUserServer({
    adminPwHash: '2aa04e2e4fd0d86d5f4cf5063e671ec8',
    adminPwSalt: 'my_salt',
    customEndpoints: [],
    domains: [],
    firestore: getMockFirestore(mockCollections),
    gusName: 'vanilla-gus',
    isExample: true,
});
await vanillaGus.initialise();
