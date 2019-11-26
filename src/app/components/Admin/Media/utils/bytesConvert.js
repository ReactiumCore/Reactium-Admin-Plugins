/**
 * @function: getBytesWithUnit()
 * @purpose: Converts bytes to the most simplified unit.
 * @param: (number) bytes, the amount of bytes
 * @returns: (string)
 */
const units = [
    ' bytes',
    ' KB',
    ' MB',
    ' GB',
    ' TB',
    ' PB',
    ' EB',
    ' ZB',
    ' YB',
];

export default bytes => {
    if (isNaN(bytes)) {
        return;
    }

    let amountOf2s = Math.floor(Math.log(+bytes) / Math.log(2));
    if (amountOf2s < 1) {
        amountOf2s = 0;
    }

    const i = Math.floor(amountOf2s / 10);
    bytes = +bytes / Math.pow(2, 10 * i);

    // Rounds to 3 decimals places.
    if (bytes.toString().length > bytes.toFixed(3).toString().length) {
        bytes = bytes.toFixed(1);
    }

    return bytes + units[i];
};
