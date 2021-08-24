export default () => {
    const useProperCase = str => {
        if (!str) return;

        return String(str)
            .toLowerCase()
            .split(' ')
            .map(function(word) {
                return word.replace(word[0], word[0].toUpperCase());
            })
            .join(' ');
    };

    return useProperCase;
};
