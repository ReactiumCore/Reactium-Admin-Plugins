// @flow

import _ from 'underscore';
import op from 'object-path';
import isHotkey from 'is-hotkey';
import Registry from '../Registry';
import Reactium, { useIsContainer as isContainer } from 'reactium-core/sdk';

export default class Hotkeys extends Registry {
    constructor() {
        super();
        this.isContainer = isContainer();
    }

    onKeyboardEvent(event: Object) {
        let next = true;
        this.list.forEach(item => {
            if (next === false) return;

            const { key, callback, scope } = item;
            if (!scope || !key || typeof callback !== 'function') return;

            const isKey = isHotkey(key, event);
            if (!isKey) return;

            if (!this.isContainer(event.target, scope)) return;
            next = callback(event, key) || true;
        });
    }
}
