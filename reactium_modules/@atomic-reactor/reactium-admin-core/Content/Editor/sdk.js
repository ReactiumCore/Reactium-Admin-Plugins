import _ from 'underscore';
import op from 'object-path';
import { Button } from 'reactium-ui';
import Reactium, { __, Registry } from '@atomic-reactor/reactium-core/sdk';

Reactium.Cache.set('content', {});
Reactium.Enums.cache.content = 10000;
const ENUMS = {
    TITLE_LENGTH: 4,
    REQUIRED: ['title'],
    ERROR: {
        TITLE_LENGTH: __('title paramater must be 4 characters or more'),
        REQUIRED: __('is a required parameter'),
        STRING: __('%key must be of type String'),
        UUID: __('uuid is a required parameter'),
    },
};

class SDK {
    constructor() {
        this.__pagination = {};
        this.__listComponents = new Registry('ContentList', 'id');
        this.__editorComponents = new Registry('ContentEditor', 'id');

        Reactium.Cache.subscribe('content-filters', ({ op }) => {
            if (['set', 'del'].includes(op)) this.filterCleanse();
        });
    }

    get Editor() {
        return this.__editorComponents;
    }

    get ListComponents() {
        return this.__listComponents;
    }

    get pagination() {
        return this.__pagination;
    }

    get data() {
        return _.clone(Reactium.Cache.get('content', {}));
    }

    get filterCleanse() {
        return () => {
            let cleansed = false;
            const filters = this.filters;
            Object.keys(filters).forEach((ns) => {
                const fields = Object.keys(filters[ns]);
                fields.forEach((field) => {
                    const value = op.get(filters, [ns, field]);
                    if (_.isArray(value) && value.length < 1) {
                        op.del(filters, [ns, field]);
                        cleansed = true;
                    }
                });
            });

            if (cleansed) Reactium.Cache.set('content-filters', filters);
        };
    }

    get filterOptions() {
        const opt = {
            status: Object.values(Reactium.Content.STATUS),
        };

        return (type, ns) => {
            ns = ns || 'admin-content-filter-options';

            // @reactium hook.content-filters Object collection of content filters grouped by the field
            Reactium.Hook.runSync(ns, opt);

            if (type) {
                Reactium.Hook.runSync(`${ns}-${type}`, opt);
            }

            return opt;
        };
    }

    get filters() {
        let items = Reactium.Cache.get('content-filters');
        items = !items ? {} : items;
        return _.clone(items);
    }

    get filtersByType() {
        return (type) => _.clone(op.get(this.filters, type, {}));
    }

    get isFilter() {
        return ({ field, type, value }) =>
            Array.from(op.get(this.filters, [type, field], [])).includes(value);
    }

    get isFiltered() {
        return (type) => {
            let values = false;

            const filters = this.filters;
            Object.keys(filters).forEach((ns) => {
                if (values === true || type !== ns) return;

                const fields = Object.keys(filters[ns]);
                fields.forEach((field) => {
                    const value = op.get(filters, [ns, field]);
                    values = _.isArray(value) && value.length > 0;
                });
            });

            return values;
        };
    }

    get toggleFilter() {
        return ({ field, type, value }) => {
            const filtered = this.isFilter({ field, type, value });
            if (filtered) this.removeFilter({ field, type, value });
            else this.addFilter({ field, type, value });
        };
    }

    get addFilter() {
        return ({ field, type, value }) => {
            const filters = this.filters;

            const current = op.get(filters, [type, field], []);
            current.push(value);

            op.set(filters, [type, field], _.uniq(current));

            Reactium.Cache.set('content-filters', filters);

            return this;
        };
    }

    get removeFilter() {
        return ({ field, type, value }) => {
            const values = _.isString(value) ? [value] : _.uniq(value);

            let filters = this.filters;

            values.forEach((v) => {
                let current = op.get(filters, [type, field], []) || [];
                current = _.without(current, v);
                op.set(filters, [type, field], current);
            });

            Reactium.Cache.set('content-filters', filters);
            return this;
        };
    }

    get clearFilter() {
        return ({ type }) => {
            const filters = this.filters;
            op.del(filters, type);
            Reactium.Cache.set('content-filters', filters);
            return this;
        };
    }

    get save() {
        const isError = (req) => () =>
            _.isArray(op.get(req.context, 'error.message'));

        const getError = (req) => () => {
            let msgs = op.get(req.context, 'error.message', []);
            msgs = _.isArray(msgs) ? msgs : [];
            return msgs.join('.\n');
        };

        const setError = (req) => (msg, key) => {
            let msgs = op.get(req.context, 'error.message', []);
            msgs = _.isArray(msgs) ? msgs : [];
            msgs.push(msg);

            op.set(req.context, 'error.message', msgs);
            if (key) op.set(req.context.errors, key, msg);
        };

        const validate = async (req) => {
            req.context.errors = {};
            req.context.error.message = null;

            let required = op.get(req.context, 'required', []);

            if (!required.includes('title')) required.push('title');
            if (!required.includes('type')) required.push('type');

            required = _.uniq(required);

            required.forEach((key) => {
                const val = op.get(req.object, key);

                if (!val) {
                    req.context.error.set(
                        `[${key}:String] ${ENUMS.ERROR.REQUIRED}`,
                        key,
                    );
                }
            });

            const type = op.get(req.object, 'type');
            if (type && !_.isString(type)) {
                req.context.error.set(
                    String(ENUMS.ERROR.STRING).replace(/%key/gi, 'type'),
                );
            }

            const prom = [Reactium.Hook.run('content-validate', req)];

            if (type) {
                prom.push(Reactium.Hook.run(`content-validate-${type}`, req));
            }

            return Promise.all(prom);
        };

        return async (obj, skipValidation = false) => {
            obj = this.utils.serialize(obj);

            const req = {
                object: obj,
                context: {},
            };

            req.context.errors = {};
            req.context.isError = isError(req);
            req.context.required = ENUMS.REQUIRED;

            req.context.error = {
                message: null,
                set: setError(req),
                get: getError(req),
            };

            const type = op.get(req.object, 'type');

            await Promise.all([
                Reactium.Hook.run('content-before-save', req),
                Reactium.Hook.run(`content-before-save-${type}`, req),
            ]);

            if (skipValidation !== true) {
                await validate(req);
            }

            if (req.context.isError()) {
                throw new Error(req.context.error.get());
            }

            await Promise.all([
                Reactium.Hook.run('content-save', req),
                Reactium.Hook.run(`content-save-${type}`, req),
            ]);

            try {
                const newObj = await Reactium.Cloud.run(
                    'content-save',
                    req.object,
                );
                if (!_.isError(newObj)) {
                    const cached = Reactium.Cache.get('content') || {
                        [type]: {},
                    };
                    op.set(cached, [type, newObj.get('uuid')], newObj.toJSON());
                    Reactium.Cache.set('content', cached);
                }

                return newObj;
            } catch (err) {
                return new Error(err.message);
            }
        };
    }

    get fetch() {
        return (params = {}) => {
            const type = op.get(params, 'type');
            if (!type) {
                throw new Error(
                    'Reactium.Content.fetch() type is a required parameter',
                );
            }

            const page = Number(op.get(params, 'page', 1));

            const cacheKey = `content_${type}_${page}`;

            const refresh = op.get(params, 'refresh');

            if (refresh === true) Reactium.Cache.del(cacheKey);

            const request =
                Reactium.Cache.get(cacheKey) ||
                Reactium.Cloud.run('content-list', params).then(
                    ({ results, ...pagination }) => {
                        op.set(this.__pagination, type, pagination);
                        results.forEach((item) => this.utils.store(type, item));
                        return Object.values(op.get(this.data, type, {}));
                    },
                );

            Reactium.Cache.set(cacheKey, request, Reactium.Enums.cache.content);

            return request;
        };
    }

    get retrieve() {
        return async (uuid) => {
            if (!uuid) {
                throw new Error(
                    `Reactium.Content.retrive() ${ENUMS.ERROR.UUID}`,
                );
            }

            let params = _.isString(uuid) ? { uuid } : uuid;

            await Reactium.Hook.run('content-retrieve', params);

            return Reactium.Cloud.run('content-retrieve', params);
        };
    }

    get delete() {
        return async ({ type, uuid }) => {
            // required fields
            Object.entries({ type, uuid }).forEach(([k, v]) => {
                if (!v) {
                    throw new Error(
                        `Reactium.Content.setStatus({ status, type, uuid }) ${k} ${ENUMS.ERROR.REQUIRED}`,
                    );
                }
            });

            // Fetch the object to destroy
            const obj = await this.retrieve(uuid);
            obj.set('status', status);

            return obj
                .destroy()
                .then((result) => {
                    const ck = `content.${type}`;
                    const cache = Reactium.Cache.get(ck);
                    if (cache && op.get(cache, uuid)) {
                        this.utils.store(type, { uuid }, true);
                    }
                    return result;
                })
                .catch((err) => {
                    throw new Error(err.message);
                });
        };
    }

    get setStatus() {
        return async ({ status, type, uuid }) => {
            // required fields
            Object.entries({ status, type, uuid }).forEach(([k, v]) => {
                if (!v) {
                    throw new Error(
                        `Reactium.Content.setStatus({ status, type, uuid }) ${k} ${ENUMS.ERROR.REQUIRED}`,
                    );
                }
            });

            // Fetch the object and update the status
            const obj = await this.retrieve(uuid);
            obj.set('status', status);

            return obj
                .save()
                .then((result) => {
                    const ck = `content.${type}`;
                    const cache = Reactium.Cache.get(ck);
                    if (cache && op.get(cache, uuid)) {
                        op.set(cache, [uuid, 'status'], status);
                        op.set(cache, [uuid, 'updatedAt'], moment().toString());
                        this.utils.store(type, cache[uuid]);
                    }

                    return result;
                })
                .catch((err) => {
                    throw new Error(err.message);
                });
        };
    }

    get utils() {
        return {
            serialize: (obj) => (op.get(obj, 'id') ? obj.toJSON() : obj),

            store: (type, item, remove = false) => {
                if (!type) {
                    throw new Error(
                        'Reactium.Content.store() type is a required parameter',
                    );
                }
                if (item) {
                    item = _.isFunction(item.toJSON) ? item.toJSON() : item;

                    const data = this.data;

                    if (remove === true) {
                        op.del(data, [type, item.uuid]);
                    } else {
                        op.set(data, [type, item.uuid], item);
                    }

                    Reactium.Cache.set('content', data);
                }

                return this;
            },
        };
    }

    newObject(type) {
        Reactium.Cache.set('reset', `/admin/content/${type}/new`);
        Reactium.Routing.history.push('/admin/reset');
    }
}

Reactium.Content = new SDK();

Reactium.Content.STATUS = {
    DRAFT: { label: 'DRAFT', value: 'DRAFT' },
    PENDING: { label: 'PENDING', value: 'PENDING' },
    PUBLISHED: { label: 'PUBLISHED', value: 'PUBLISHED' },
    DELETED: { label: 'DELETED', value: 'DELETED' },
};

Reactium.Content.COLOR = {
    REMOVE: Button.ENUMS.COLOR.DANGER,
    DRAFT: Button.ENUMS.COLOR.TERTIARY,
    DELETED: Button.ENUMS.COLOR.DANGER,
    PENDING: Button.ENUMS.COLOR.WARNING,
    PUBLISHED: Button.ENUMS.COLOR.SUCCESS,
};

export default Reactium.Content;
