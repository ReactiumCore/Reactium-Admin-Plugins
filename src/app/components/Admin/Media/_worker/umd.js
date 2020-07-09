const axios = require('axios');
const _ = require('underscore');
const op = require('object-path');
const ENUMS = require('../_utils/sdk/enums').default;

class Uploader {
    constructor(worker) {
        this.active = {};
        this.interval = null;
        this.maxUploads = ENUMS.MAX_UPLOADS;
        this.queue = {};
        this.req = null;
        this.uploads = {};
        this.worker = worker;
        this.working = false;
    }

    get maxed() {
        return Object.keys(this.active).length >= this.maxUploads;
    }

    async initialize({ parseAppId, restAPI, sessionToken }) {
        this.req = axios.create({
            baseURL: restAPI,
            headers: {
                'X-Parse-Application-Id': parseAppId,
                'X-Parse-Session-Token': sessionToken,
            },
        });

        return Boolean(parseAppId && restAPI);
    }

    async onMessage(e) {
        const { action, params } = e.data;
        switch (action) {
            default:
                const result = await this[action].call(this, params);
                this.worker.postMessage({ type: action, result });
        }
    }

    fileToBytes(file) {
        return new Promise(resolve => {
            const reader = new FileReader();

            reader.onload = () => {
                const bytes = new Uint8Array(reader.result);
                resolve(Object.values(bytes));
            };

            reader.readAsArrayBuffer(file);
        });
    }

    async addFile({ file, ...upload }) {
        // 1.0 - Get the upload ID
        const { ID } = upload;

        // 2.0 - Add file to Q and uploads list
        this.queue[ID] = file;
        this.uploads[ID] = upload;

        // 3.0 - Start the interval if it isn't running
        if (!this.interval) {
            this.interval = setInterval(() => this.run(), 1000);
        }
    }

    removeFile(ID) {
        delete this.queue[ID];
        delete this.active[ID];
        delete this.uploads[ID];
    }

    async update({ file, ...data }) {
        if (file) {
            data['filedata'] = await this.fileToBytes(file);
        }

        return this.req
            .post('/functions/media-update', data, {
                onUploadProgress: e => {
                    const { loaded, total } = e;
                    const progress = Math.min(loaded / total, 0.95);

                    this.worker.postMessage({
                        type: 'status',
                        params: {
                            progress,
                            status: ENUMS.STATUS.UPLOADING,
                            result: null,
                        },
                    });
                },
            })
            .then(resp => {
                this.worker.postMessage({
                    type: 'status',
                    params: {
                        progress: 1,
                        status: ENUMS.STATUS.UPLOADING,
                        result: null,
                    },
                });

                this.worker.postMessage({
                    type: 'status',
                    params: {
                        progress: 1,
                        status: ENUMS.STATUS.COMPLETE,
                        result: resp.data.result,
                    },
                });
            })
            .catch(({ response }) => {
                const { code, error: message } = response.data;

                this.worker.postMessage({
                    type: 'error',
                    params: { code, message },
                });
            });
    }

    async upload(ID, file, meta) {
        file = file || op.get(this, ['queue', ID]);
        meta = meta || op.get(this, ['uploads', ID]);

        if (!file || !meta) {
            if (ID) this.removeFile(ID);
            return Promise.reject();
        }

        const data = await this.fileToBytes(file);

        return this.req
            .post(
                '/functions/media-upload',
                { meta, data },
                {
                    onUploadProgress: e => {
                        const { loaded, total } = e;
                        const progress = Math.min(loaded / total, 0.95);

                        this.worker.postMessage({
                            type: 'status',
                            params: {
                                ID,
                                progress,
                                status: ENUMS.STATUS.UPLOADING,
                            },
                        });
                    },
                },
            )
            .then(resp => {
                this.worker.postMessage({
                    type: 'status',
                    params: {
                        ID,
                        objectId: op.get(resp, 'data.result.objectId'),
                        progress: 1,
                        status: ENUMS.STATUS.COMPLETE,
                        url: op.get(resp, 'data.result.url'),
                        result: op.get(resp, 'data.result'),
                    },
                });

                if (ID) this.removeFile(ID);
            });
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }

    run() {
        // 0.0 - Check active count
        if (this.maxed || this.working) return;

        // 0.1 - Clear timer if q is empty
        const keys = Object.keys(this.queue);
        if (keys.length < 1) return this.stop();

        // 0.2 - Check to see if we're already in the middle of this action
        this.working = true;

        // 1.0 - Upload the next batch of files
        while (Object.keys(this.queue).length > 0) {
            if (this.maxed) break;

            const ID = Object.keys(this.queue)[0];

            this.active[ID] = this.upload(ID);

            delete this.queue[ID];
        }

        this.working = null;
    }
}

self.uploader = new Uploader(self);

self.addEventListener('message', e => self.uploader.onMessage(e));
