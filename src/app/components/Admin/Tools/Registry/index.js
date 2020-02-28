import _ from 'underscore';
import op from 'object-path';

export default class Registry {
    constructor() {
        this.__registered = [];
        this.__unregister = [];
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
        return _.chain(registered)
            .sortBy('order')
            .value();
    }

    register(id, data) {
        data['order'] = op.get(data, 'order', 200);
        const item = { ...data, id };
        this.__registered.push(item);
        return item;
    }

    unregister(id) {
        if (id) this.__unregister.push(id);
        return this.__unregister;
    }
}
