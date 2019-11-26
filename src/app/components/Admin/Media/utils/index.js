import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import Reactium from 'reactium-core/sdk';

const activeUploads = files => {
    if (!files) {
        const { getState } = Reactium.Plugin.redux.store;
        files = op.get(getState().Media, 'uploads', {});
    }

    return _.chain(Array.from(Object.values(files)))
        .where({ action: ENUMS.STATUS.UPLOADING })
        .value();
};

const completedUploads = files => {
    if (!files) {
        const { getState } = Reactium.Plugin.redux.store;
        files = op.get(getState().Media, 'files', {});
    }

    return _.chain(Array.from(Object.values(files)))
        .where({ action: ENUMS.STATUS.COMPLETE })
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

export { activeUploads, completedUploads, queuedUploads };
