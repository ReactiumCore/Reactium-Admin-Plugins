import _ from 'underscore';
import op from 'object-path';

export default class Registry {
    constructor(name) {
        this.__name = name || 'Registry';
        this.__protected = [];
        this.__registered = [];
        this.__unregister = [];
    }

    get protected() {
        return this.__protected;
    }

    get registered() {
        return this.__registered;
    }

    get unregistered() {
        return this.__unregister;
    }

    get list() {
        const unregister = _.uniq(this.__unregister);
        const registered = Array.from(this.__registered).filter(
            ({ id }) => !unregister.includes(id),
        );
        return Object.values(
            _.chain(registered)
                .sortBy('order')
                .indexBy('id')
                .value(),
        );
    }

    isProtected(id) {
        return this.__protected.includes(id);
    }

    isRegistered(id) {
        return !!_.findWhere(this.__registered, { id });
    }

    protect(id) {
        this.__protected = _.chain([this.__protected, [id]])
            .flatten()
            .uniq()
            .value();

        return this;
    }

    register(id, data = {}) {
        if (this.isProtected(id) && this.isRegistered(id)) {
            return new Error(
                `${this.__name} unable to replace protected item ${id}`,
            );
        }

        data['order'] = op.get(data, 'order', 100);
        const item = { ...data, id };
        this.__registered.push(item);
        return this;
    }

    unprotect(id) {
        this.__protected = _.without(this.__protected, id);
        return this;
    }

    unregister(id) {
        if (!id) return this;

        id = _.chain([id])
            .flatten()
            .uniq()
            .value();

        id.forEach(() => {
            if (this.__protected.includes(id)) return;
            this.__unregister.push(id);
        });

        return this;
    }
}
