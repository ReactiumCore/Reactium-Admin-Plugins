export default class Plugin {
    constructor({ type, callback, order = 100 }) {
        this.__order = order;
        this.__type = type;
        this.plugin = editor => {
            try {
                callback(editor);
            } catch (err) {
                console.error(err);
            }
            return editor;
        };
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

    set callback(newCallback) {
        this.plugin = editor => {
            try {
                newCallback(editor);
            } catch (err) {
                console.error(err);
            }
            return editor;
        };
    }

    get type() {
        return this.__type;
    }
}
