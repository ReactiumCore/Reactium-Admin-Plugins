const hexToRgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
              parseInt(result[1], 16),
              parseInt(result[2], 16),
              parseInt(result[3], 16),
          ]
        : [hex];
};

const rgbToHex = (r, g, b) => {
    const hex = c => {
        const str = Number(c).toString(16);
        return str.length === 1 ? '0' + str : str;
    };

    return String('#' + hex(r) + hex(g) + hex(b)).toUpperCase();
};

export { hexToRgb, rgbToHex };
