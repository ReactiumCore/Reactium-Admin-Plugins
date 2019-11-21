import _ from 'underscore';
import b64 from 'base64-js';
import ENUMS from '../enums';

const fileToChunks = file => {
    const chunks = _.chain(b64.toByteArray(file.dataURL.split(',').pop()))
        .chunk(ENUMS.MAX_BYTES)
        .value();

    return { ...chunks };
};

export { fileToChunks as default };
