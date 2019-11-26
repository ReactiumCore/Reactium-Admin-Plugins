import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import Reactium from 'reactium-core/sdk';
import { completedUploads } from './index';

export default () => {
    const { dispatch, getState } = Reactium.Plugin.redux.store;
    const { match } = getState().Router;
    if (!String(match.path).startsWith('/admin/media')) return;

    const { files: currentFiles = {}, uploads = {} } = getState().Media;
    const completed = _.pluck(completedUploads(files), 'ID');

    completed.forEach(ID => {
        delete files[ID];
        delete uploads[ID];
    });

    dispatch({
        domain: ENUMS.DOMAIN,
        type: ENUMS.ACTION_TYPE,
        update: { files, uploads },
    });
};
