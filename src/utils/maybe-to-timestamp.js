import { isoDateRx } from './regexps.js';

export const maybeToTimestamp = (deps, val) => {
    if (val === null) return null;
    const type = typeof val;
    if (
        type === 'string' &&
        val.length === 24 &&
        isoDateRx.test(val)
    ) {
        const date = new Date(val);
        if (isNaN(date.valueOf())) return val; // eg '2024-99-99T99:99:99.111Z'
        return deps.Timestamp.fromDate(date);
    }
    if (type !== 'object') return val;
    const entries = Object.entries(val);
    if (
        entries.length === 2 &&
        typeof val._seconds === 'number' &&
        typeof val._nanoseconds === 'number' &&
        val._seconds % 1 === 0 && // TODO check it's ok to have negative seconds
        val._nanoseconds % 1 === 0 &&
        val._nanoseconds >= 0
    ) {
        return new deps.Timestamp(val._seconds, val._nanoseconds);
    }

    // Recursively convert the object's sub-values into `Timestamp` instances.
    // TODO guard against infinite recursion, though not a problem if val has
    // come from `JSON.parse()`.
    return Object.fromEntries(
        entries.map(([k, v]) => [ k, maybeToTimestamp(deps, v) ])
    );
};
