import _ from 'underscore';
import b64 from 'base64-js';
import op from 'object-path';
import ENUMS from '../enums';
import domain from '../domain';
import Reactium from 'reactium-core/sdk';

const debug = (...args) =>
    ENUMS.DEBUG === true ? console.log('upload', ...args) : () => {};

const fileToChunks = file =>
    _.chunk(b64.toByteArray(file.dataURL.split(',').pop()), ENUMS.MAX_BYTES);

const upload = queue => {
    const { dispatch, getState } = Reactium.Plugin.redux.store;
    const state = getState().Media;
    const { files = {}, uploads = {} } = state;

    queue.forEach(file => {
        const ID = file.ID;
        const directory = file.directory || '/assets/uploads';

        files[ID]['action'] = ENUMS.STATUS.UPLOADING;

        if (op.get(uploads, ID)) return;

        const obj = {
            ...file.upload,
            chunks: fileToChunks(file),
            directory,
            ID,
        };

        uploads[ID] = obj;
    });

    dispatch({
        domain: domain.name,
        type: ENUMS.ACTION_TYPE,
        update: { files, uploads },
    });

    return true;
};

export { upload as default };
