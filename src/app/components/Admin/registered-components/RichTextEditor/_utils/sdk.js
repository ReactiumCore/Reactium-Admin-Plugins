import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import { Editor } from 'slate';
import isHotkey from 'is-hotkey';

import {
    isBlockActive,
    isMarkActive,
    toggleBlock,
    toggleMark,
} from '../_utils';

class Registry {
    constructor() {
        this.__registered = [];
        this.__unregister = [];
    }

    get registered() {
        return this.__registered;
    }

    register(id, plugin) {
        const { order = 200 } = plugin;
        const item = { ...plugin, id, order };
        this.__registered.push(item);

        return item;
    }

    unregister(id) {
        if (id) {
            this.__unregister.push(id);
        }
        return this.__unregister;
    }

    list() {
        const unregister = _.uniq(this.__unregister);
        const registered = Array.from(this.__registered).filter(
            ({ id }) => !unregister.includes(id),
        );
        return _.chain(registered)
            .sortBy('order')
            .indexBy('id')
            .value();
    }
}

class RTE {
    constructor() {
        this.ENUMS = ENUMS;
        this.Block = new Registry();
        this.Format = new Registry();
        this.Plugin = new Registry();
        this.isBlockActive = isBlockActive;
        this.isHotkey = isHotkey;
        this.isMarkActive = isMarkActive;
        this.toggleBlock = toggleBlock;
        this.toggleMark = toggleMark;
    }

    get blocks() {
        return this.Block.list();
    }

    get formats() {
        return this.Format.list();
    }

    get plugins() {
        return this.Plugin.list();
    }

    get nodes() {
        const nodes = Object.entries({ ...this.formats, ...this.blocks }).map(
            ([id, value]) => {
                op.set(value, 'id', id);
                return value;
            },
        );

        return _.sortBy(nodes, 'order');
    }

    hotKey(editor, e) {
        if (!editor || !e) return;

        if (this.isHotkey('backspace', e) || this.isHotkey('enter', e)) {
            const [node] = Editor.node(editor, editor.selection);
            const [parent] = Editor.parent(editor, editor.selection);

            const text = op.get(node, 'text');
            const type = op.get(parent, 'type');

            if (type === 'li' && String(text).length < 1) {
                e.preventDefault();
                return this.toggleBlock(editor, 'p');
            }
        }

        this.nodes.forEach(item => {
            let { id, insert, block, leaf, hotkey } = item;

            if (!hotkey) return;

            const key =
                typeof hotkey === 'string' ? hotkey : op.get(hotkey, 'key');

            if (!this.isHotkey(key, e)) return;

            const callback =
                typeof hotkey !== 'string' ? op.get(hotkey, 'callback') : null;

            if (typeof callback === 'function') {
                return callback(e, editor);
            }

            e.preventDefault();

            if (insert) {
                return insertNode(editor, id, item.insert);
            }

            if (leaf) {
                return this.toggleMark(editor, id);
            }

            if (block) {
                return this.toggleBlock(editor, id);
            }
        });
    }
}

export default new RTE();
