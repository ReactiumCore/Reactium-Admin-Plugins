import React from 'react';
import api from 'appdir/api/config';
import Reactium from 'reactium-core/sdk';
const SCRIPT = '/assets/js/umd/media-uploader/media-uploader.js';
const UNSUPPORTED = 'ERROR: Workers are not supported in this browser';

const noop = () => {};

export default (hook, path) => {
    path = path || SCRIPT;
    let w;
    const Worker = typeof window !== 'undefined' ? window.Worker : null;

    if (Worker !== null) {
        const sessionToken = Reactium.User.getSessionToken();
        w = new Worker(path);

        w.addEventListener('message', e => {
            const { type, params, ...data } = e.data;
            Reactium.Hook.run(hook, { type, params, data });
        });

        w.postMessage({
            action: 'initialize',
            params: { ...api, sessionToken },
        });
    } else {
        w = {
            addEventListener: () => console.log(UNSUPPORTED),
            postMessage: () => console.log(UNSUPPORTED),
        };
    }

    return w;
};
