import ENUMS from '../enums';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';

export default evt => {
    const { dispatch, getState } = Reactium.Plugin.redux.store;
    const state = getState().Media;
    const { directory, files = {}, uploads } = state;

    const setState = update =>
        dispatch({
            domain: ENUMS.DOMAIN,
            type: ENUMS.ACTION_TYPE,
            update,
        });

    // console.log({ [evt.type]: directory });

    // remove files if necessary
    const removed = op.get(evt, 'removed') || [];
    removed.forEach(file => {
        delete files[file.ID];
    });

    const added = op.get(evt, 'added') || [];
    added.forEach(file => {
        if (!files[file.ID]) {
            files[file.ID] = file;
            files[file.ID]['directory'] = directory;
        }
    });

    Object.values(evt.files).forEach(file => {
        let action = op.get(file, 'action', ENUMS.EVENT.ADDED);
        const upload = op.get(uploads, file.ID);

        if (upload) {
            action = op.get(upload, 'action');
            files[file.ID]['url'] = op.get(upload, 'url');
            try {
            } catch (err) {}
        }

        files[file.ID]['action'] = action;
    });

    setState({ files });
};
