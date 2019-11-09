const suffixes = ['', 'k', 'm', 'b', 't'];

export default value => {
    if (!value || value === 0) {
        return;
    }

    let newValue = value;
    if (value >= 1000) {
        const suffixNum = Math.floor(('' + value).length / 3);
        let shortValue = '';

        for (let precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat(
                (suffixNum != 0
                    ? value / Math.pow(1000, suffixNum)
                    : value
                ).toPrecision(precision),
            );
            const dotLessShortValue = (shortValue + '').replace(
                /[^a-zA-Z 0-9]+/g,
                '',
            );
            if (dotLessShortValue.length <= 2) {
                break;
            }
        }

        if (shortValue % 1 != 0) {
            shortValue = shortValue.toFixed(1);
        }
        newValue = shortValue + suffixes[suffixNum];

        newValue = String(newValue).replace('0.', '.');
    }

    return newValue;
};
