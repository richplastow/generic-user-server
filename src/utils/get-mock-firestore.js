/** ### `getMockFirestore()`
 *
 * Instantiates and returns a mock, in-memory Firestore client, useful for testing.
 *
 * @return {object}
 */
export const getMockFirestore = (collections = []) => {
    return {
        databaseId: 'mock',
        doc(id) {
            const [ collectionName, docId ] = id.split('/');
            let coll = collections.find(({ id }) => id === collectionName);
            let doc = coll ? coll[docId] : null;
            return {
                get() {
                    return {
                        exists: !!doc,
                        get(key) { return doc[key] }
                    }
                },
                set(newDoc) {
                    if (!coll) {
                        coll = { id: collectionName };
                        collections.push(coll);
                    }
                    doc = coll[docId] = newDoc;
                },
            }
        },
        listCollections() {
            return collections;
        }
    }
};
