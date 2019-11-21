import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import upload from './upload';
import domain from '../domain';
import Reactium from 'reactium-core/sdk';

const activeUploads = files =>
    _.chain(Array.from(Object.values(files)))
        .where({ action: ENUMS.STATUS.UPLOADING })
        .value();

const queuedUploads = files =>
    _.chain(Array.from(Object.values(files)))
        .where({ action: ENUMS.STATUS.QUEUED })
        .value();

const debug = (caller = 'processQueue', ...args) =>
    ENUMS.DEBUG === true ? console.log(caller, ...args) : () => {};

const processQueue = task => {
    const { getState } = Reactium.Plugin.redux.store;
    const currentFiles = op.get(getState(), 'Media.files', {});
    const active = activeUploads(currentFiles);

    if (Object.values(currentFiles).length < 1) return;
    if (active.length >= ENUMS.MAX_UPLOADS) return;

    const count = Math.abs(ENUMS.MAX_UPLOADS - active.length);
    const queued = queuedUploads(currentFiles).slice(0, count);
    if (queued.length < 1) return;

    return upload(queued);
};

export { processQueue as default };
