import _ from 'underscore';
import uuid from 'uuid/v4';
import ENUMS from './enums';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';
import api from 'appdir/api/config';
import Parse from 'appdir/api';

const WORKER = Symbol('worker');

const debug = (caller, ...args) =>
    ENUMS.DEBUG === true ? console.log(caller, ...args) : () => {};

const valueToArray = value => _.compact(Array.isArray(value) ? value : [value]);

const reduxCheck = () => {
    if (!Reactium.Plugin.redux) {
        throw new Error(
            'Reactium.Media.upload() requires the Reactium.Plugin.redux store.',
        );
        return true;
    }
};

const cloudCheck = () => {
    if (!Reactium.Cloud) {
        throw new Error(
            'Reactium.Media.uploadChunk() requires the Reactium.Cloud API.',
        );
        return true;
    }
};

class Media {
    constructor() {
        this.ENUMS = ENUMS;

        const Worker = typeof window !== 'undefined' ? window.Worker : null;

        if (Worker !== null) {
            api['sessionToken'] = Parse.User.current().getSessionToken();
            const msg = {
                action: 'initialize',
                params: api,
            };

            this.worker = new Worker(
                'assets/js/umd/media-uploader/media-uploader.js',
            );

            this.worker.addEventListener('message', this.onMessage);

            this.worker.postMessage(msg);
        }
    }

    onMessage(e) {
        const { action, ...params } = e.data;
        console.log({ action, ...params });
    }
}

export default new Media();
