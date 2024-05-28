export const parseDelimitedData = (delimiter, rawPostData='') => {
    return rawPostData
        .split(delimiter)
        .reduce((parsed, pair) => {
            const [key, val] = pair.split('=');
            return { ...parsed, [key]: val };
        }, {});
}
