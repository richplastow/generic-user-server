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
                        data() { return doc }, // TODO deep clone would be better
                        exists: !!doc,
                        get(key) { return doc[key] },
                        update(data) {
                            Object.entries(data)
                                .forEach(([ key, val ]) => doc[key] = val)
                        },
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
