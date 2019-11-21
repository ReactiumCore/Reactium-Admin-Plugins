import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import domain from '../domain';
import Reactium from 'reactium-core/sdk';
import fileToChunks from './fileToChunks';

const activeUploads = files =>
    _.chain(Array.from(Object.values(files)))
        .where({ action: ENUMS.STATUS.UPLOADING })
        .value();

const queuedUploads = files =>
    _.chain(Array.from(Object.values(files)))
        .where({ action: ENUMS.STATUS.QUEUED })
        .value();

const debug = (caller = 'addToQueue', ...args) =>
    ENUMS.DEBUG === true ? console.log(caller, ...args) : () => {};

const addToQueue = task => {
    const { dispatch, getState } = Reactium.Plugin.redux.store;
    const state = getState().Media;
    const { files: currentFiles = {}, uploads = {} } = state;
    const active = activeUploads(currentFiles);

    if (Object.values(currentFiles).length < 1) return;
    if (active.length >= ENUMS.MAX_UPLOADS) return;

    const count = Math.abs(ENUMS.MAX_UPLOADS - active.length);
    const queued = queuedUploads(currentFiles).slice(0, count);
    if (queued.length < 1) return;

    queued.forEach(file => {
        const ID = file.ID;
        const directory = file.directory || '/assets/uploads';

        currentFiles[ID]['action'] = ENUMS.STATUS.UPLOADING;

        if (op.get(uploads, ID)) return;

        const obj = {
            ...file.upload,
            chunks: fileToChunks(file),
            directory,
            ID,
        };

        uploads[ID] = obj;
    });

    return dispatch({
        domain: domain.name,
        type: ENUMS.ACTION_TYPE,
        update: { files: currentFiles, uploads },
    });
};

export { addToQueue as default };
