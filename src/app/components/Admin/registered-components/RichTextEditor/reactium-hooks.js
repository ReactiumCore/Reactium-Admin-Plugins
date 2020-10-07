import op from 'object-path';
import domain from './domain';
import RTE from './_utils/sdk';
import Settings from './Settings';
import RichTextEditor from './index';
import defaultPlugins from './_plugins';
import Reactium from 'reactium-core/sdk';

// Create the SDK entry on the Reactium singleton
Reactium.RTE = op.get(Reactium, 'RTE', RTE);

Reactium.Plugin.register(domain.name, Reactium.Enums.priority.highest).then(
    () => {
        // Register the UI Component
        Reactium.Component.register('RichTextEditor', RichTextEditor);
        Reactium.Component.register('RichTextEditorSettings', Settings);

        // Register default plugins
        Object.entries(defaultPlugins).forEach(([id, item]) =>
            Reactium.RTE.Plugin.register(id, item),
        );
    },
);

/**
 * @api {RegisteredComponent} <RichTextEditor/> RichTextEditor
 * @apiName RichTextEditor
 * @apiGroup Registered Component
 * @apiDescription The RichTextEditor is a content editable text editor built on top of [Slate](https://docs.slatejs.org). While Slate is a completely customizable framework for building rich text editors, we placed some framework around it to fit the Reactium model.

## Basic Usage
The RichTextEditor is a registered component and can be imported two different ways:

### 1. Import Statement
```
import RichTextEditor from 'components/Admin/registered-components/RichTextEditor';
```

### 2. useHookComponent Statement
```
import { useHookComponent } from 'reactium-core/sdk';
```
```
const RichTextEditor = useHookComponent('RichTextEditor');
```

## Extending
You can extend the RichTextEditor by registering a plugin with the `Reactium.RTE` SDK.

### Creating A Plugin
When creating a plugin, you should start with the `RTEPlugin` class as your base
by importing it into a `reactium-hooks.js` file.

#### 1. Import RTEPlugin Class
```
import RTEPlugin from 'components/Admin/registered-components/RichTextEditor/RTEPlugin';
```

#### 2. Create New Plugin Instance
```
const MyPlugin = new RTEPlugin({ type: 'my-plugin-type' });
```

#### 3. Create Callback Function
The callback function is where the magic happens and is your chance to augment the Slate editor instance:

```
MyPlugin.callback = editor => { return editor; }
```
> **Note:** your callback function must return the `editor` object

#### 4. Register Plugin
Now that your plugin is setup, register it with the Reactium.RTE SDK so that editors can use the plugin:

```
Reactium.RTE.Plugin.register('my-plugin', MyPlugin);
```
 *
 * @apiParam {Object} [blocks='Reactium.RTE.blocks'] Customize the block elements used in the current editor.
 * @apiParam {Object} [buttons='Reactium.RTE.buttons'] Customize the button elements used in the current editor.
 * @apiParam {Object} [colors='Reactium.RTE.colors'] Customize the colors used in the colors dropdown.
 * @apiParam {Object} [fonts='Reactium.RTE.fonts'] Customize the fonts used in the font dropdown of the current editor.
 * @apiParam {Object} [formats='Reactium.RTE.formats'] Customize the format elements used in the current editor.
 * @apiParam {Object} [hotkeys='Reactium.RTE.hotkeys'] Customize the keyboard shortcuts used in the current editor.
 * @apiParam {Object} [plugins='Reactium.RTE.plugins'] Customize the plugins used in the current editor.
 * @apiParam {Object} [exclude] Filter the list of blocks, buttons, and formats used in the current editor to exclude the specified elements.
 * @apiParam {Object} [include] Filter the list of blocks, buttons, and formats used in the current editor to only the specified elements.
 * @apiParam {Object} [filter] Filter the list of blocks, buttons, and formats used in the current editor with a custom filter function.

 * @apiParam {String} [className] Class name to apply to the wrapper div.
 * @apiParam {Object} [dragProps] Properties applied to the configuration panel component.
 * @apiParam {String} [id=UUID] The unique id of the editor.
 * @apiParam {String} [name='content'] The name of the editor to be used when inside a form.
 * @apiParam {String} [placeholder='Enter content...'] Text to display when the editor is empty.
 * @apiParam {Boolean} [panel=true] Whether to include the properties panel component.
 * @apiParam {Boolean} [sidebar=true] Whether to include the sidebar component.
 * @apiParam {Boolean} [toolbar=true] Whetehr to include the toolbar component.
 * @apiParam {Object} [value] The value of the editor.
 * @apiParam {Function} [onBlur] Function to call when the `blur` event is triggered.
 * @apiParam {Function} [onChange] Function to call when the `change` event is triggered.
 * @apiParam {Function} [onFocus] Function to call when the `focus` event is triggered.
 * @apiParam (Event) {FocusEvent} blur Dispatched when the editor loses focus.
 * @apiParam (Event) {Event} change Dispatched when the editor is changed.
 * @apiParam (Event) {FocusEvent} focus Dispatched when the editor receives focus.
 */
