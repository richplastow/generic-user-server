/** ### `MockTimestamp`
 *
 * Simulates part of Firestore's `Timestamp` functionality, for development and
 * testing.
 * 
 * See <https://firebase.google.com/docs/reference/node/firebase.firestore.Timestamp>
 */
export class MockTimestamp {
    _nanoseconds;
    _seconds;
    constructor(seconds, nanoseconds) {
        this._seconds = seconds;
        this._nanoseconds = nanoseconds;
    }
    get nanoseconds() { return this._nanoseconds }
    get seconds() { return this._seconds }
    isEqual(other) {
        return this._nanoseconds === other.nanoseconds && this._seconds === other.seconds;
    }
    now() {
        return MockTimestamp.fromDate(new Date());
    }
    toDate() {
        return new Date(this.toMillis());
    }
    toJSON() { // eg `res.json({ result })` should output a simple ISO date string
        return this.toDate().toISOString(); // note that real Firestore does not do this
    }
    toMillis() {
        return (this._seconds * 1000) + Math.round(this._nanoseconds / 1000000);
    }
    // valueOf() {} // TODO
    static fromDate(date) {
        return MockTimestamp.fromMillis(date.valueOf());
    }
    static fromMillis(millis) {
        const millisecondsInSecond = millis % 1000;
        return new MockTimestamp(
            (millis - millisecondsInSecond) / 1000,
            millisecondsInSecond * 1000000,
        );
    }
};
