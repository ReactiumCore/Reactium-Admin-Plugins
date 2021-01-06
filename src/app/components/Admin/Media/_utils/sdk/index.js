import axios from 'axios';
import _ from 'underscore';
import ENUMS from './enums';
import moment from 'moment';
import op from 'object-path';
import slugify from 'slugify';
import Reactium from 'reactium-core/sdk';

const api = Reactium.ActiniumConfig;
const SCRIPT = '/assets/js/umd/media-uploader/media-uploader.js';
const paramToArray = value => _.compact(Array.isArray(value) ? value : [value]);

const mapFileToUpload = file => {
    const {
        ID,
        mapped = false,
        name: filename,
        progress = 0,
        size: total,
        status,
        statusAt,
    } = file;

    if (mapped === true) return file;

    return {
        ID,
        action,
        mapped: true,
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
        this.selected = null;
        this.worker = null;
        this.fetching = false;
        this.__filters = [Object.keys(ENUMS.TYPE)];
        this.__searchFields = [
            'ext',
            'filename',
            'meta.description',
            'meta.tags',
            'meta.title',
            'type',
            'url',
        ];

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

        // User DirtyEvent, ScrubEvent
        this.DirtyEvent = Reactium.Utils.registryFactory('MediaDirtyEvent');
        this.DirtyEvent.protect(['change']).protected.forEach(id =>
            this.DirtyEvent.register(id),
        );

        this.ScrubEvent = Reactium.Utils.registryFactory('MediaScrubEvent');
        this.ScrubEvent.protect([
            'loaded',
            'save-success',
        ]).protected.forEach(id => this.ScrubEvent.register(id));
    }

    __onStatus(params) {
        const { uploads = {} } = this.state;
        const { ID, progress, status } = params;

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

    get completed() {
        const expired = 5;
        return _.where(Object.values(op.get(this.state, 'uploads', {})), {
            status: String(ENUMS.STATUS.COMPLETE).toLowerCase(),
        }).filter(
            ({ statusAt }) =>
                moment().diff(moment(new Date(statusAt)), 'seconds') >= expired,
        );
    }

    get filters() {
        return this.__filters;
    }

    get page() {
        const { getState } = Reactium.Plugin.redux.store;
        return Number(op.get(getState().Router, 'params.page', 1));
    }

    get search() {
        const { getState } = Reactium.Plugin.redux.store;
        return op.get(getState().SearchBar, 'value');
    }

    get state() {
        const { getState } = Reactium.Plugin.redux.store;
        return getState().Media;
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

    createFromURL(params) {
        return Reactium.Cloud.run('media-create-from-url', params);
    }

    crop({ field = 'thumbnail', objectId, options, url }) {
        return Reactium.Cloud.run('media-image-crop', {
            field,
            objectId,
            options,
            url,
        });
    }

    download(objectId) {
        const file =
            typeof objectId === 'string' ? this.file(objectId) : objectId;
        const url = this.url(file);
        const { filename } = file;

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

    file(objectId) {
        const library = _.indexBy(
            op.get(this.state, 'library', []),
            'objectId',
        );

        return op.get(library, objectId);
    }

    fileType(filename) {
        let ext = String(filename)
            .split('.')
            .pop();
        ext = String(ext).toUpperCase();

        let type = _.chain(
            Object.entries(ENUMS.TYPE).map(([type, values]) => {
                if (values.includes(ext)) return type;
                return null;
            }),
        )
            .compact()
            .uniq()
            .value()[0];

        type = type || 'FILE';
        return type;
    }

    filter(params, dataArray) {
        const directory = op.get(params, 'directory');
        const search = op.get(params, 'search');
        const limit = op.get(params, 'limit', 50);
        const page = Number(op.get(params, 'page', -1));
        const type = op.get(params, 'type');

        dataArray = dataArray || op.get(this.state, 'library');
        const filters = op.get(params, 'filters', this.__filters);
        const searchFields = op.get(
            params,
            'searchFields',
            this.__searchFields,
        );
        const match = search && String(search).toLowerCase();
        const currentFilters = _.flatten([filters]).map(f =>
            String(f).toUpperCase(),
        );

        let filtered = dataArray.filter(item => {
            let { directory: dir } = item;

            // search
            if (match && searchFields.length > 0) {
                const score = searchFields.reduce((s, field) => {
                    let val = op.get(item, field, '');
                    val = Array.isArray(val) ? val.join(', ') : val;
                    val = String(val).toLowerCase();

                    s += val.includes(match) ? 1 : 0;

                    return s;
                }, 0);

                if (score === 0) return false;
            }

            // directory
            if (
                directory &&
                String(dir).toLowerCase() !== String(directory).toLowerCase()
            ) {
                return false;
            }

            // type filter
            if (!currentFilters.includes(item.type)) return false;
            if (type && item.type !== type) return false;

            return true;
        });

        if (page > 0) {
            const index = limit * page - limit;
            const pages = Math.ceil(filtered.length / limit);
            const next = page < pages ? page + 1 : undefined;
            const prev = page > 1 ? page - 1 : undefined;

            const pagination = {
                ...op.get(this.state, 'pagination'),
                empty: dataArray.length < 1,
                count: filtered.length,
                index,
                limit,
                page,
                pages,
                next,
                prev,
            };

            this.setState({ pagination });

            filtered = Array.from(filtered).splice(index, limit);
        }

        return _.indexBy(filtered, 'objectId');
    }

    retrieve(objectId) {
        return Reactium.Cloud.run('media-retrieve', { objectId });
    }

    setState(newState = {}, silent = false) {
        const { dispatch } = Reactium.Plugin.redux.store;
        dispatch({
            type: ENUMS.ACTION_TYPE,
            domain: ENUMS.DOMAIN,
            update: newState,
        });

        if (silent !== true) Reactium.Hook.run('media-change', newState);
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

        // 4.0 - Return updated uploads
        return uploads;
    }

    url(fileObject) {
        const file =
            typeof fileObject === 'string'
                ? this.file(fileObject).file
                : fileObject;

        if (!file) return;

        let url = typeof file.url === 'function' ? file.url() : file.url;

        if (!url) return;

        url = String(url).replace(/undefined/gi, '/api');

        if (typeof window !== 'undefined' && String(url).substr(0, 1) === '/') {
            url = `${window.location.protocol}//${window.location.host}${url}`;
        }

        return url;
    }

    async __onWorkerMessage(e) {
        const { type, ...data } = e.data;
        const params = op.get(e.data, 'params');
        const hook = { data, params, type };

        Reactium.Hook.runSync('media-worker', hook);
        await Reactium.Hook.run('media-worker', hook);

        switch (type) {
            case 'status':
                this.__onStatus(params);

                if (op.get(params, 'status' === 'complete')) {
                    Reactium.Hook.runSync('media-complete', hook);
                    await Reactium.Hook.run('media-complete', hook);
                }
                break;
        }
    }

    async delete(objectId) {
        const library = _.indexBy(
            op.get(this.state, 'library', []),
            'objectId',
        );

        if (op.has(library, objectId)) {
            op.del(library, objectId);
            this.setState({ library: Object.values(library) });
        }

        const result = await Reactium.Cloud.run('media-delete', { objectId });
        await Reactium.Hook.run('media-delete', { objectId });
        return result;
    }

    async fetch(params = {}) {
        const limit = op.get(params, 'limit', 50);
        const page = Number(op.get(params, 'page', this.page));
        const directory = op.get(params, 'directory');
        const search = op.get(params, 'search');

        const media = await Reactium.Cloud.run('media', {
            directory,
            limit,
            page,
            search,
        });

        const files = Object.values(op.get(media, 'files', {}));
        const directories = op.get(media, 'directories', []);
        const index = limit * page - limit;
        const pages = Math.ceil(files.length / limit);
        const next = page < pages ? page + 1 : undefined;
        const prev = page > 1 ? page - 1 : undefined;
        const pagination = {
            empty: files.length < 1,
            count: files.length,
            page,
            pages,
            index,
            limit,
            next,
            prev,
        };

        const newState = {
            library: files,
            pagination,
            directories,
            fetched: Date.now(),
        };

        this.setState(newState, true);

        return media;
    }
}

export default Media;
