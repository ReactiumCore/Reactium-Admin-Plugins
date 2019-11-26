import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import Reactium from 'reactium-core/sdk';

const debug = (...args) =>
    ENUMS.DEBUG === true ? console.log('uploadTask', ...args) : () => {};

export default async task => {
    const { getState } = Reactium.Plugin.redux.store;

    // 1.0 - Batch the chunks
    let { uploads = {} } = getState().Media;
    uploads = Object.values(uploads).filter(item =>
        Boolean(op.get(item, 'status') !== ENUMS.STATUS.COMPLETE),
    );
    if (uploads.length < 1) return;

    const selection = _.chain(
        uploads.map(upload => {
            const { chunks = {} } = upload;
            const length = Object.keys(chunks).length;
            const obj = Object.entries(chunks).map(([index, chunk]) => ({
                ...upload,
                chunk,
                index,
                length,
            }));

            delete obj.chunks;

            return obj;
        }),
    )
        .flatten()
        .chunk(ENUMS.MAX_UPLOADS)
        .value();

    while (selection.length > 0) {
        const batch = selection.shift();
        for (let i = 0; i < batch.length; i++) {
            const upload = batch[i];
            const result = await Reactium.Media.uploadChunk(upload);

            if (op.get(result, 'status') === ENUMS.STATUS.COMPLETE) {
                console.log(result);
            }
        }
    }
};
