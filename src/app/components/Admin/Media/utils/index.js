import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import Reactium from 'reactium-core/sdk';

const activeUploads = files => {
    if (!files) {
        const { getState } = Reactium.Plugin.redux.store;
        files = op.get(getState().Media, 'files', {});
    }

    return _.chain(Array.from(Object.values(files)))
        .where({ action: ENUMS.STATUS.UPLOADING })
        .value();
};

const queuedUploads = files => {
    if (!files) {
        const { getState } = Reactium.Plugin.redux.store;
        files = op.get(getState().Media, 'files', {});
    }

    return _.chain(Array.from(Object.values(files)))
        .where({ action: ENUMS.STATUS.QUEUED })
        .value();
};

export { activeUploads, queuedUploads };
