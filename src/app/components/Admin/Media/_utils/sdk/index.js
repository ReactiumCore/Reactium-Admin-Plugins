import axios from 'axios';
import _ from 'underscore';
import uuid from 'uuid/v4';
import ENUMS from './enums';
import moment from 'moment';
import op from 'object-path';
import slugify from 'slugify';
import api from 'appdir/api/config';
import Reactium from 'reactium-core/sdk';

const SCRIPT = '/assets/js/umd/media-uploader/media-uploader.js';

const debug = (caller, ...args) =>
    ENUMS.DEBUG === true ? console.log(caller, ...args) : () => {};

const paramToArray = value => _.compact(Array.isArray(value) ? value : [value]);

const mapFileToUpload = file => {
    const {
        ID,
        name: filename,
        progress = 0,
        size: total,
        status,
        statusAt,
    } = file;

    return {
        ID,
        action,
        file,
        filename,
        progress,
        status,
        statusAt,
        total,
    };
};

class Media {
    constructor() {
        this.ENUMS = ENUMS;
        this.worker = null;
        this.fetching = false;

        const Worker = typeof window !== 'undefined' ? window.Worker : null;

        if (Worker !== null) {
            const sessionToken = Reactium.User.getSessionToken();

            this.worker = new Worker(SCRIPT);
            this.worker.addEventListener('message', e =>
                this.__onWorkerMessage(e),
            );
            this.worker.postMessage({
                action: 'initialize',
                params: { ...api, sessionToken },
            });
        }
    }

    __onStatus(params) {
        const { uploads = {} } = this.state;
        const { ID, progress, status, url } = params;

        if (!ID) return;

        op.set(uploads, [ID, 'status'], status);
        op.set(uploads, [ID, 'statusAt'], Date.now());

        if (progress > 0) {
            op.set(uploads, [ID, 'progress'], Number(progress));
        }

        if (progress === 1) this.fetch();

        if (op.has(params, 'url')) {
            op.set(uploads, [ID, 'url'], params.url);
        }

        this.setState({ uploads });
    }

    async __onWorkerMessage(e) {
        const { params, type, ...data } = e.data;

        await Reactium.Hook.run('media-worker', { data, params, type });

        switch (type) {
            case 'status':
                this.__onStatus(params);
                break;
        }
    }

    get completed() {
        const expired = 5;
        return _.where(Object.values(op.get(this.state, 'uploads', {})), {
            status: ENUMS.STATUS.COMPLETE,
        }).filter(
            ({ statusAt }) =>
                moment().diff(moment(new Date(statusAt)), 'seconds') >= expired,
        );
    }

    get state() {
        const { getState } = Reactium.Plugin.redux.store;
        return getState().Media;
    }

    get page() {
        const { getState } = Reactium.Plugin.redux.store;
        return Number(op.get(getState().Router, 'params.page', 1));
    }

    get search() {
        const { getState } = Reactium.Plugin.redux.store;
        return op.get(getState().SearchBar, 'value');
    }

    cancel(files) {
        // 0.0 - Covnert single file to array of files
        files = paramToArray(files);

        // 1.0 - Get State
        const { uploads = {} } = this.state;

        // 2.0 - Loop through files array
        files.forEach(file => {
            delete uploads[file.ID];
            this.worker.postMessage({ action: 'removeFile', params: file.ID });
        });

        // 3.0 - Update State
        this.setState({ uploads });
    }

    clear() {
        // 0.0 - exit if we're on the /admin/media routes
        const { getState } = Reactium.Plugin.redux.store;
        const route = getState().Router.pathname;
        if (String(route).startsWith('/admin/media')) return;

        // 1.0 - get state
        const { uploads = {} } = this.state;
        const len = Object.keys(uploads).length;
        let changed = false;

        // 2.0 - Get completed uploads
        this.completed.forEach(item => {
            changed = true;
            delete uploads[item.ID];
        });

        if (changed) {
            this.setState({ uploads });
        }
    }

    setState(newState = {}) {
        const { dispatch } = Reactium.Plugin.redux.store;
        dispatch({
            type: ENUMS.ACTION_TYPE,
            domain: ENUMS.DOMAIN,
            update: newState,
        });
    }

    update(params) {
        this.worker.postMessage({ action: 'update', params });
    }

    upload(files, directory = ENUMS.DIRECTORY, data = {}) {
        // 0.0 - convert single file to array of files
        files = paramToArray(files);

        // 1.0 - Get State
        const { uploads = {} } = this.state;

        // 2.0 - Loop through files array
        files.forEach(file => {
            // 2.1 - Update uploads state object
            let item = mapFileToUpload(file);
            item['filename'] = slugify(item.filename);
            item['directory'] = directory;
            item['status'] = ENUMS.STATUS.QUEUED;
            item = { ...item, ...data };

            uploads[file.ID] = item;

            // 2.2 - Send file to media-upload Web Worker
            this.worker.postMessage({ action: 'addFile', params: item });
        });

        // 3.0 - Update State
        this.setState({ uploads });
    }

    async fetch(params) {
        const library = op.get(this.state, 'library', {});
        const currentFilters = op.get(this.state, 'filters');
        const currentDir = op.get(this.state, 'directory');
        const page = op.get(params, 'page', this.page);
        const search = op.get(params, 'search', this.search);
        const filters = op.get(params, 'filters', currentFilters);
        const directory = op.get(params, 'directory', currentDir);

        const media = await Reactium.Cloud.run('media', {
            directory,
            filters,
            page,
            search,
            limit: 50,
        });

        const { directories = [ENUMS.DIRECTORY], files, ...pagination } = media;

        if (Object.keys(files).length > 0) {
            library[page] = files;
        } else {
            delete library[page];
        }

        this.setState({
            directories,
            library,
            pagination,
            fetched: Date.now(),
        });
    }

    delete(objectId) {
        const { library = {} } = this.state;

        for (let page of Object.keys(library)) {
            page = Number(page);
            if (op.has(library, [page, objectId])) {
                delete library[page][objectId];
                this.setState({ library });
                break;
            }
        }

        return Reactium.Cloud.run('media-delete', { objectId });
    }

    file(objectId) {
        const { library = {} } = this.state;

        for (let page of Object.keys(library)) {
            page = Number(page);
            if (op.has(library, [page, objectId])) {
                return library[page][objectId];
            }
        }
    }

    retrieve(objectId) {
        return Reactium.Cloud.run('media-retrieve', { objectId });
    }

    url(objectId) {
        let url;
        if (typeof objectId === 'string') {
            const file = this.file(objectId);
            url = op.get(file, 'url');
        } else {
            url = op.has(objectId, '__type') ? objectId.url : objectId.url();
        }

        url = url.replace(/undefined/gi, '/api');

        if (typeof window !== 'undefined' && String(url).substr(0, 1) === '/') {
            url = `${window.location.protocol}//${window.location.host}${url}`;
        }

        return url;
    }

    download(objectId) {
        const url = this.url(objectId);
        const { filename } = this.file(objectId);

        return axios.get(url, { responseType: 'blob' }).then(({ data }) => {
            const href = window.URL.createObjectURL(new Blob([data]));
            const elm = document.createElement('a');

            document.body.appendChild(elm);

            elm.setAttribute('download', filename);
            elm.setAttribute('href', href);
            elm.click();
            elm.remove();
        });
    }

    crop({ field = 'thumbnail', objectId, options, url }) {
        return Reactium.Cloud.run('media-image-crop', {
            field,
            objectId,
            options,
            url,
        });
    }
}

export default new Media();
