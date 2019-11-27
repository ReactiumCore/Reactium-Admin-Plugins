import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import Reactium from 'reactium-core/sdk';
import { activeUploads, queuedUploads } from './index';

export default () => {
    // Get current state
    const { getState } = Reactium.Plugin.redux.store;
    const { directory, files: currentFiles = {} } = getState().Media;

    // Exit if no file objects
    if (Object.keys(currentFiles).length < 1) return;

    // Get active uploads count
    //   -> exit if at max upload count
    const active = activeUploads(currentFiles);
    if (active.length >= ENUMS.MAX_UPLOADS) return;

    // Slice the current files and queue them for upload
    //   -> exit if none
    const count = Math.abs(ENUMS.MAX_UPLOADS - active.length);
    const queued = queuedUploads(currentFiles).slice(0, count);
    if (queued.length < 1) return;

    // Schedule the uploads
    return Reactium.Media.upload(queued);
};
