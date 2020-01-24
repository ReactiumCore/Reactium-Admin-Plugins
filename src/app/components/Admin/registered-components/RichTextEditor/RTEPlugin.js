export default class Plugin {
    constructor({ type, callback, order = 100 }) {
        this.__order = order;
        this.__type = type;
        this.plugin = callback;
    }

    get order() {
        return this.__order;
    }

    set order(value) {
        this.__order = value;
    }

    get callback() {
        return this.plugin;
    }

    set callback(value) {
        this.plugin = value;
    }

    get type() {
        return this.__type;
    }
}
