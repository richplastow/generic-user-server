/** ### `getMockFirestore()`
 *
 * Instantiates and returns a mock, in-memory Firestore client, useful for testing.
 *
 * @return {object}
 */
export const getMockFirestore = (collections = []) => {
    return {
        databaseId: 'gus-mock-firestore',
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
                    }
                },
                get id() {
                    return id;
                },
                set(newDoc) {
                    if (!coll) {
                        coll = { id: collectionName };
                        collections.push(coll);
                    }
                    doc = coll[docId] = newDoc;
                },
                update(data) {
                    if (!coll) {
                        coll = { id: collectionName };
                        collections.push(coll); // TODO check if this is what Firestore does
                    }
                    doc = coll[docId];
                    Object.entries(data)
                        .forEach(([ key, val ]) => doc[key] = val)
                },
            }
        },
        listCollections() {
            return collections;
        }
    }
};
