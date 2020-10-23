import uuid from 'uuid/v4';
import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../enums';
import isHotkey from 'is-hotkey';
import { plural } from 'pluralize';
import RTEPlugin from '../RTEPlugin';
import { Editor, Node, Path, Transforms } from 'slate';
import { isBlockActive, isMarkActive, toggleBlock, toggleMark } from '.';

// TODO: Convert to Reactium.Utils.registryFactory
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
        this.pluginFactory = options => new RTEPlugin(options);

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
        id =
            String(id)
                .charAt(0)
                .toUpperCase() + String(id).slice(1);

        if (op.get(this.Ext, id) || op.get(this, id))
            throw new Error('RTE registry "' + id + '" already exists');

        this.Ext[id] = new Registry();
        this[id] = this.Ext[id];

        return this[id];
    }

    register(ext, id, data) {
        ext = op.get(this.Ext, ext, this.extend(ext));
        ext.register(id, data);
    }

    unregister(ext, id) {
        ext = op.get(this.Ext, ext);
        if (ext) {
            ext.unregister(id);
        }
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

    onKeyDown(editor, event, hotkeys) {
        if (!editor || !event) return;

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

            try {
                next = callback({ editor, event, keys }) || next;
            } catch (err) {
                next = false;
            }
        });
    }

    isEmpty(node) {
        const text = Node.string(node);
        return op.get(node, 'blocked') === true
            ? false
            : String(text).length < 1;
    }

    getNodeByID(editor, id) {
        const nodes = Editor.nodes(editor, {
            at: [],
            match: node => op.get(node, 'id') === id,
        });

        let node = _.first(Array.from(nodes));
        return node ? _.object(['node', 'path'], node) : { node: {}, path: [] };
    }

    getNode(editor, path) {
        let node, p, root;

        if (_.isString(path)) {
            const n = this.getNodeByID(editor, path);
            node = op.get(n, 'node');
            p = op.get(n, 'path');
            root = p.length === 1;
        } else {
            path = path || editor.selection.anchor.path;

            root = path.length === 1;
            p = Array.from(path);
            p = root === true ? [Math.max(Number(_.first(p) - 1), 0), 0] : p;

            const result = Editor.above(editor, { at: p });

            p = result.pop();
            node = result.pop();
        }

        let empty = Object.keys(node).length > 0 ? this.isEmpty(node) : true;

        return { node, path: p, root, empty, blocked: op.get(node, 'blocked') };
    }

    siblings(editor, path) {
        let children = [];
        path = path || editor.selection.anchor.path;
        path = Array.from(path);

        path.pop();

        let parent = Editor.above(editor, { at: path });
        if (parent) {
            parent = _.object(['node', 'path'], parent);
            children = op.get(parent, 'node.children', []);
        }
        return children;
    }

    sibling(editor, path, offset = -1) {
        path = path || editor.selection.anchor.path;
        path = Array.from(path);

        let node;

        const siblings = this.siblings(editor, path);
        const sibpath = Array.from(path);
        sibpath.pop();

        if (sibpath.length >= 1) {
            let idx = sibpath.pop() + offset;
            if (!_.range(siblings.length).includes(idx)) {
                return;
            }
            node = siblings[idx];
        }

        return node;
    }

    before(editor, path) {
        return this.sibling(editor, path);
    }

    after(editor, path) {
        return this.sibling(editor, path, 1);
    }

    getBlock(editor, path) {
        const nodes = Array.from(
            Node.ancestors(editor, path, { reverse: true }),
        );
        const blocks = nodes.filter(([node]) => {
            if (Editor.isEditor(node)) return false;
            return op.get(node, 'type') === 'block';
        });

        let block = _.first(blocks);
        block = block ? _.object(['node', 'path'], block) : null;

        if (block) {
            op.set(block, 'empty', String(Node.string(block.node)).length < 1);
        }

        return block;
    }

    insertBlock(editor, children, options = {}) {
        children = Array.isArray(children) ? children : [children];

        let { at, id, ...props } = options;
        id = id || uuid();
        id = String(id).startsWith('block-') ? id : `block-${id}`;

        const args = [editor];
        if (at) args.push({ at });

        let parent = Editor.above(...args) || Editor.node(...args);
        parent = parent ? _.object(['node', 'path'], parent) : null;

        const block = parent ? this.getBlock(editor, parent.path) : null;
        const isEmpty = Editor.isEmpty(editor, parent.node);
        const path = parent.path;
        let next = Path.next(path);

        const node = {
            ...props,
            blocked: true,
            children,
            id,
            type: 'block',
        };

        // Transforms.move(editor, { edge: 'end' });

        if (block) {
            if (block.empty) {
                Transforms.insertNodes(editor, node, {
                    at: Path.next(block.path),
                    split: true,
                });
                Transforms.delete(editor, { at: block.path });
            } else {
                Transforms.insertNodes(editor, node, { at: next, split: true });
                if (isEmpty) Transforms.delete(editor, { at: path });
            }
        } else {
            Transforms.insertNodes(editor, node, { at: next, split: true });
            if (isEmpty) Transforms.delete(editor, { at: path });
        }
    }
}

export default new RTE();

/**
 * @api {Function} Block.register(id,options) Block.register()
 * @apiGroup Reactium.RTE
 * @apiName Block.register
 * @apiDescription Register a block level formatter.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the block.
 * @apiParam {Object} options The configuration object for the block.
 * @apiParam (Options) {Component} element The React component to render.
 * @apiParam (Options) {Boolean} [inline=false] Whether the block is inline or not.
 * @apiParam (Options) {Number} [order=100] The sort order of the block. Useful when overwriting an existing block.
 * @apiExample Usage:

 // reactium-hooks.js

import React from 'react';
import Reactium from 'reactium-core/sdk';
import { RTEPlugin } from 'reactium_modules/@atomic-reactor/admin/registered-components/RichTextEditor';

const Plugin = new RTEPlugin({ type: 'MyPlugin' });

Plugin.callback = editor => {
    // Register h6 block
    Reactium.RTE.Block.register('h6', {
        inline: false,
        element: props => <h6 {...props} />,
        order: 6
    });

    return editor;
};

export default Plugin;
 *
 */

/**
 * @api {Function} Block.unregister(id) Block.unregister()
 * @apiGroup Reactium.RTE
 * @apiName Block.unregister
 * @apiDescription Unregister a block level formatter.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the block.
 */

/**
 * @api {Function} Block.list() Block.list()
 * @apiGroup Reactium.RTE
 * @apiName Block.list
 * @apiDescription Return a list of the registered blocks.
 */

/**
 * @api {Function} Button.register(id,options) Button.register()
 * @apiGroup Reactium.RTE
 * @apiName Button.register
 * @apiDescription Register a button in the editor toolbar and/or sidebar.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the button.
 * @apiParam {Object} options The configuration object for the button.
 * @apiParam (Options) {Component} button The React component to render. If you have an `onClick` callback on your button, be sure to call `preventDefault()` so that the editor doesn't lose focus when the button is clicked.
 * @apiParam (Options) {Number} [order=100] The sort order of the button. Useful whe overwriting an existing button.
 * @apiParam (Options) {Boolean} [sidebar=false] Whether the button should show up in the sidebar. The sidebar is used for formats and blocks that don't require text to be selected.
 * @apiParam (Options) {Boolean} [toolbar=false] Whether the button should show up in the toolbar. The toolbar is used for formats and blocks that require text to be selected.
 * @apiExample Usage:
// reactium-hooks.js

import React from 'react';
import Reactium from 'reactium-core/sdk';
import { Button } from '@atomic-reactor/reactium-ui';
import { RTEPlugin } from 'reactium_modules/@atomic-reactor/admin/registered-components/RichTextEditor';

const Plugin = new RTEPlugin({ type: 'MyPlugin' });

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
 * @api {Function} Button.unregister(id) Button.unregister()
 * @apiGroup Reactium.RTE
 * @apiName Button.unregister
 * @apiDescription Unregister a button.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the button.
 */

/**
 * @api {Function} Button.list() Button.list()
 * @apiGroup Reactium.RTE
 * @apiName Button.list
 * @apiDescription Return a list of the registered buttons.
 */

/**
  * @api {Function} Color.register(id,options) Color.register()
  * @apiGroup Reactium.RTE
  * @apiName Color.register
  * @apiDescription Register a color used in the block level text formatter configuration panel.

> **Note:** This function should be called within the editor plugin callback function.
  * @apiParam {String} id The id of the color.
  * @apiParam {Object} options The configuration object for the color.
  * @apiParam (Options) {String} label Display label for the color.
  * @apiParam (Options) {String} value Valid CSS HEX color value.
  * @apiExample Example
 // reactium-hooks.js

 import Reactium from 'reactium-core/sdk';
 import { RTEPlugin } from 'reactium_modules/@atomic-reactor/admin/registered-components/RichTextEditor';

 const Plugin = new RTEPlugin({ type: 'MyPlugin' });

 Plugin.callback = editor => {
     // Register Red color
     Reactium.RTE.Color.register('red', {
         label: 'Red',
         value: '#FF0000',
     });

     return editor;
 };

 export default Plugin;
*/

/**
 * @api {Function} Color.unregister(id) Color.unregister()
 * @apiGroup Reactium.RTE
 * @apiName Color.unregister
 * @apiDescription Unregister a color.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the color.
 */

/**
 * @api {Function} Color.list() Color.list()
 * @apiGroup Reactium.RTE
 * @apiName Color.list
 * @apiDescription Return a list of the registered colors.
 */

/**
 * @api {Function} Font.register(id,options) Font.register()
 * @apiGroup Reactium.RTE
 * @apiName Font.register
 * @apiDescription Register a font used in the block level text formatter configuration panel.

> **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the font.
 * @apiParam {Object} options The configuration object for the font.
 * @apiParam (Options) {String} label Display label for the font.
 * @apiParam (Options) {Number[]} size List of font sizes your font to supports.
 * @apiParam (Options) {Object[]} weight List of font weights your font supports.
 * @apiParam (Options) {String} weight[label] Display label for the font-weight.
 * @apiParam (Options) {String} weight[family] Valid CSS font-family value.
 * @apiParam (Options) {Number} weight[weight] Valid CSS font-weight value.
 * @apiExample Usage:
 // reactium-hooks.js

import React from 'react';
import Reactium from 'reactium-core/sdk';
import { RTEPlugin } from 'reactium_modules/@atomic-reactor/admin/registered-components/RichTextEditor';

const Plugin = new RTEPlugin({ type: 'MyPlugin' });

Plugin.callback = editor => {
    // Register Arial font
    Reactium.RTE.Font.register('arial', {
        label: 'Arial',
        size: [10, 12, 14, 16, 18, 24, 32, 44, 56, 64, 72, 96],
        weight: [
            { label: 'Regular', family: 'Arial, sans-serif', weight: 400 },
            { label: 'Semi-Bold', family: 'Arial, sans-serif', weight: 600 },
            { label: 'Bold', family: 'Arial, sans-serif', weight: 800 },
        ],
    });

    return editor;
};

export default Plugin;
 */

/**
 * @api {Function} Font.unregister(id) Font.unregister()
 * @apiGroup Reactium.RTE
 * @apiName Font.unregister
 * @apiDescription Unregister a font.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the font.
 */

/**
 * @api {Function} Font.list() Font.list()
 * @apiGroup Reactium.RTE
 * @apiName Font.list
 * @apiDescription Return a list of the registered fonts.
 */

/**
 * @api {Function} Format.register(id,options) Format.register()
 * @apiGroup Reactium.RTE
 * @apiName Format.register
 * @apiDescription Register an inline formatter.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the format.
 * @apiParam {Object} options The configuration object for the format.
 * @apiParam (Options) {Component} element The React component to render.
 * @apiParam (Options) {Boolean} [inline=true] Whether the element is inline or not.
 * @apiParam (Options) {Number} [order=100] The sort order of the element. Useful when overwriting an existing format.
 * @apiExample Usage:
 // reactium-hooks.js

import React from 'react';
import Reactium from 'reactium-core/sdk';
import { RTEPlugin } from 'reactium_modules/@atomic-reactor/admin/registered-components/RichTextEditor';

const Plugin = new RTEPlugin({ type: 'MyPlugin' });

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

/**
 * @api {Function} Format.unregister(id) Format.unregister()
 * @apiGroup Reactium.RTE
 * @apiName Format.unregister
 * @apiDescription Unregister a inline formatter.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the formatter.
 */

/**
 * @api {Function} Format.list() Format.list()
 * @apiGroup Reactium.RTE
 * @apiName Format.list
 * @apiDescription Return a list of the registered inline formats.
 */

/**
 * @api {Function} Hotkey.register(id,options) Hotkey.register()
 * @apiGroup Reactium.RTE
 * @apiName Hotkey.register
 * @apiDescription Register a keyboard shortcut.

> **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the hotkey.
 * @apiParam {Object} options The configuration object for the hotkey.
 * @apiParam (Options) {Array} keys The key combination. See [isHotkey](https://www.npmjs.com/package/is-hotkey) for available values.
 * @apiParam (Options) {Function} callback The function to execute when the hotkey is pressed. If your function returns `false` no other matching hotkey definitions will be processed. The callback function receives a single paramter object containing a reference to the current `editor` and the keyboard `event`.
 * @apiParam (Options) {Number} [order=100] The sort order of the hotkey. Useful when overwriting an existing hotkey or processing the same keys with a different set of rules.
 * @apiExample Usage:
 // reactium-hooks.js

import React from 'react';
import Reactium from 'reactium-core/sdk';
import { RTEPlugin } from 'reactium_modules/@atomic-reactor/admin/registered-components/RichTextEditor';

const Plugin = new RTEPlugin({ type: 'MyPlugin' });

Plugin.callback = editor => {
    // register bold hotkey
    Reactium.RTE.Hotkey.register('toggle-bold', {
        keys: ['mod+b'],
        callback: ({ editor, event }) => {
            event.preventDefault();
            Reactium.RTE.toggleMark(editor, Plugin.type);
        },
    });

    return editor;
};

export default Plugin;
 */

/**
 * @api {Function} Hotkey.unregister(id) Hotkey.unregister()
 * @apiGroup Reactium.RTE
 * @apiName Hotkey.unregister
 * @apiDescription Unregister a hotkey.

 > **Note:** This function should be called within the editor plugin callback function.
 * @apiParam {String} id The id of the hotkey.
 */

/**
 * @api {Function} Hotkey.list() Hotkey.list()
 * @apiGroup Reactium.RTE
 * @apiName Hotkey.list
 * @apiDescription Return a list of the registered hotkeys.
 */

/**
 * @api {Function} Plugin.register(id,plugin) Plugin.register()
 * @apiGroup Reactium.RTE
 * @apiName Plugin.register
 * @apiDescription Register a RichTextEditor plugin.

> **Note:** This function should be called within a `reactium-hooks.js` file.
 * @apiParam {String} id The id of the plugin.
 * @apiParam {RTEPlugin} plugin The plugin instance.

 */

/**
  * @api {Function} Plugin.unregister(id) Plugin.unregister()
  * @apiGroup Reactium.RTE
  * @apiName Plugin.unregister
  * @apiDescription Unregister a plugin.

  > **Note:** This function should be called within the editor plugin callback function.
  * @apiParam {String} id The id of the plugin.
  */

/**
 * @api {Function} Plugin.list() Plugin.list()
 * @apiGroup Reactium.RTE
 * @apiName Plugin.list
 * @apiDescription Return a list of the registered plugins.
 */

/**
 * @api {Class} RTEPlugin(constructor) RTEPlugin
 * @apiGroup Reactium.RTE
 * @apiName RTEPlugin
 * @apiDescription RichTextEditor plugin instance used as the base when creating or extending RichTextEditor functionality.

## Import
```
import { RTEPlugin } from 'reactium_modules/@atomic-reactor/admin/registered-components/RichTextEditor';
```

> **See:** [Slate Plugins](https://docs.slatejs.org/concepts/07-plugins) for more information on how to augment the editor instance.

 * @apiParam (Constructor) {Function} callback The plugin function where your editor customization and registrations are executed. The callback can be overwritten via the `.callback` property.
 * @apiParam (Constructor) {Number} [order=100] The sort order applied to your plugin when registering it with the RichTextEditor component. The order can be overwritten via the `.order` property.
 * @apiParam (Constructor) {String} [type] The type is how your plugin is identified with the certain RichTextEditor functionality such as blocks and formats. The type cannot be changed outside of the constructor.
 * @apiExample Example Plugin
// withBold.js

import React from 'react';
import Reactium from 'reactium-core/sdk';
import { Button } from '@atomic-reactor/reactium-ui';
import RTEPlugin from 'reactium_modules/@atomic-reactor/admin/registered-components/RichTextEditor/RTEPlugin';

const withBold = new RTEPlugin({ type: 'bold', order: 100 });

withBold.callback = editor => {
    // Register inline formatter
    Reactium.RTE.Format.register('bold', {
        element: props => <strong {...props} />,
    });

    // Register toolbar button
    Reactium.RTE.Button.register('bold', {
        order: 110,
        toolbar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                active={Reactium.RTE.isMarkActive(editor, 'bold')}
                onClick={e => Reactium.RTE.toggleMark(editor, 'bold', e)}
                {...props}>
                <span className='ico'>B</span>
            </Button>
        ),
    });

    // Register hotkeys
    Reactium.RTE.Hotkey.register('bold', {
        keys: ['mod+b'],
        callback: ({ editor, event }) => {
            event.preventDefault();
            Reactium.RTE.toggleMark(editor, 'bold');
        },
    });

    // Editor overrides
    const { isInline } = editor;

    // override the editor.isInline function to check for the 'bold' element type.
    editor.isInline = element =>
        element.type === 'bold' ? true : isInline(element);

    // Return the updated editor object
    return editor;
};

export {
    withBold
};

 ...

// reactium-hooks.js

import Reactium from 'reactium-core/sdk';
import { withBold } from './withBold';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';

Reactium.Plugin.register('rte-plugins', Reactium.Enums.priority.lowest).then(
    () => {
        // Register my custom plugin - withBold
        Reactium.RTE.Plugin.register('withBold', withBold);

        // Register 3rd party Slate plugins
        Reactium.RTE.Plugin.register('withReact', new RTEPlugin({ callback: withReact, order: 0 }));
        Reactium.RTE.Plugin.register('withHistory', new RTEPlugin({ callback: withHistory, order: 1 }));
    },
);
 */

/**
 * @api {Function} extend(id) extend()
 * @apiGroup Reactium.RTE
 * @apiName extend
 * @apiDescription Creates a new Registry object that can be used in RTE plugin development.
 * @apiParam {String} id The id of the extension.
 * @apiExample Example
// reactium-hooks.js

import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('rte-plugins', Reactium.Enums.priority.lowest).then(
    () => {
        // Register RTE extension: Icon
        Reactium.RTE.extend('Icon');
    },
);
 */

/**
 * @api {Function} register(ext,id,options) register()
 * @apiGroup Reactium.RTE
 * @apiName register
 * @apiDescription Register elements on custom Registry objects.
 * @apiExample Example
// reactium-hooks.js

import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('rte-plugins', Reactium.Enums.priority.lowest).then(
    () => {
        // Register RTE extension: Icon
        Reactium.RTE.extend('Icon');

        // Register a new Icon element
        Reactium.RTE.register('Icon', 'FeatherChevronUp', {
            set: 'Feather',
            name: 'ChevronUp'
        });
    },
);
 */

/**
 * @api {Function} unregister(ext,id) unregister()
 * @apiGroup Reactium.RTE
 * @apiName unregister
 * @apiDescription Unregister elements from custom Registry objects.
 * @apiExample Example
 // reactium-hooks.js

 import Reactium from 'reactium-core/sdk';

 Reactium.Plugin.register('rte-plugins', Reactium.Enums.priority.lowest).then(
     () => {
         // Register RTE extension: Icon
         Reactium.RTE.extend('Icon');

         // Register a new Icon element
         Reactium.RTE.register('Icon', 'FeatherChevronUp', {
             set: 'Feather',
             name: 'ChevronUp'
         });

         // Unregister an Icon element
         Reactium.RTE.unregister('Icon', 'FeatherChevronUp');
     },
 );
 */
