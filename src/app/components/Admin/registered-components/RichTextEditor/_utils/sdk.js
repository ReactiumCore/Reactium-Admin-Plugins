import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import { Editor } from 'slate';
import isHotkey from 'is-hotkey';
import { plural } from 'pluralize';
import { isBlockActive, isMarkActive, toggleBlock, toggleMark } from '.';

export class Registry {
    constructor() {
        this.__registered = [];
        this.__unregister = [];
    }

    get registered() {
        return this.__registered;
    }

    register(id, data) {
        data['order'] = op.get(data, 'order', 200);
        const item = { ...data, id };
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

        this.isBlockActive = isBlockActive;
        this.isHotkey = isHotkey;
        this.isMarkActive = isMarkActive;
        this.toggleBlock = toggleBlock;
        this.toggleMark = toggleMark;

        this.Block = new Registry();
        this.Button = new Registry();
        this.Color = new Registry();
        this.Font = new Registry();
        this.Format = new Registry();
        this.Hotkey = new Registry();
        this.Plugin = new Registry();
        this.Tab = new Registry();

        this.Ext = {
            Block: this.Block,
            Button: this.Button,
            Color: this.Color,
            Font: this.Font,
            Format: this.Format,
            Hotkey: this.Hotkey,
            Plugin: this.Plugin,
            Tab: this.Tab,
        };
    }

    extend(id) {
        if (op.get(this.Ext, id))
            throw new Error('RTE registry already exists');

        this.Ext[id] = new Registry();
        return this.Ext[id];
    }

    register(ext, id, data) {
        ext = op.get(this.Ext, ext, this.extend(ext));
        ext.register(id, data);
    }

    get list() {
        return Object.entries(this.Ext).reduce((obj, [id, item]) => {
            id = String(plural(id)).toLowerCase();
            obj[id] = item.list();
            return obj;
        }, {});
    }

    get blocks() {
        return this.list.blocks;
    }

    get buttons() {
        return this.list.buttons;
    }

    get colors() {
        return this.list.colors;
    }

    get fonts() {
        return this.list.fonts;
    }

    get formats() {
        return this.list.formats;
    }

    get hotkeys() {
        return this.list.hotkeys;
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

    get plugins() {
        return this.list.plugins;
    }

    get tabs() {
        return this.list.tabs;
    }

    hotKey(editor, event, hotkeys) {
        if (!editor || !event) return;

        try {
            const [parent, parentPath] = Editor.parent(
                editor,
                editor.selection,
            );
            if (isHotkey('backspace', event)) {
                const text = _.compact([parent.children.text]);
                if (_.isEmpty(text) && parentPath.length === 1) {
                    return;
                }
            }
        } catch (err) {}

        let next = true;
        hotkeys.forEach(item => {
            if (next === false) return;

            const { keys, callback } = item;

            if (typeof callback !== 'function') return;

            const isKey =
                _.chain([keys])
                    .flatten()
                    .compact()
                    .uniq()
                    .value()
                    .filter(key => this.isHotkey(key, event)).length > 0;

            if (!isKey) return;

            next = callback({ editor, event, keys }) || next;
        });
    }
}

export default new RTE();

/**
 * @api {Function} Button.register(id,options) Button.register()
 * @apiGroup Reactium.RTE
 * @apiName Button.register
 * @apiDescription Register a button in the editor toolbar and/or sidebar.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The unique id of the button.
 * @apiParam {Object} options The configuration object for the button.
 * @apiParam (Options) {Component} button The React component to render. If you have an `onClick` callback on your button, be sure to call `preventDefault()` so that the editor doesn't lose focus when the button is clicked.
 * @apiParam (Options) {Number} [order=100] The sort order of the button.
 * @apiParam (Options) {Boolean} [sidebar=false] Whether the button should show up in the sidebar. The sidebar is used for formats and blocks that don't require text to be selected.
 * @apiParam (Options) {Boolean} [toolbar=false] Whether the button should show up in the toolbar. The toolbar is used for formats and blocks that require text to be selected.
 * @apiExample Usage:
// reactium-hooks.js

import React from 'react';
import Reactium from 'reactium-core/sdk';
import { Button } from '@atomic-reactor/reactium-ui';
import RTEPlugin from 'components/Admin/registered-components/RichTextEditor/RTEPlugin';

const Plugin = new RTEPlugin({ type: 'bold' });

Plugin.callback = editor => {
    // register toolbar button
    Reactium.RTE.Button.register('bold', {
        order: 110,
        toolbar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                {...props}
                active={Reactium.RTE.isMarkActive(editor, 'bold')}
                onClick={e => Reactium.RTE.toggleMark(editor, 'bold', e)}>
                <span className='ico'>B</span>
            </Button>
        ),
    });

    return editor;
};

export default Plugin;
 *
 */

/**
 * @api {Function} Format.register(id,options) Format.register()
 * @apiGroup Reactium.RTE
 * @apiName Format.register
 * @apiDescription Register an inline formatter.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The unique id of the button.
 * @apiParam {Object} options The configuration object for the button.
 * @apiParam (Options) {Component} element The React component to render.
 * @apiParam (Options) {Boolean} [inline=true] Whether the format is an inline format or not.
 * @apiParam (Options) {Number} [order=100] The sort order of the button.
 * @apiExample Usage:
 // reactium-hooks.js

import React from 'react';
import Reactium from 'reactium-core/sdk';
import RTEPlugin from 'components/Admin/registered-components/RichTextEditor/RTEPlugin';

const Plugin = new RTEPlugin({ type: 'bold' });

Plugin.callback = editor => {
    // register bold formatter
    Reactium.RTE.Format.register('bold', {
        element: props => <strong {...props} />,
        inline: true,
    });

    return editor;
 };

 export default Plugin;
 */
