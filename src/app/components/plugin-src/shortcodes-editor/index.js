import SDK from './sdk';
import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import ShortcodeRTE from './RTE';
import Shortcodes from './Shortcodes';
import SaveWidget from './SaveWidget';
import Breadcrumbs from './Breadcrumbs';
import SidebarWidget from './SidebarWidget';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

import { Editor, Transforms } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';

const useDelete = id => {
    const editor = useEditor();
    const getSelection = ID => {
        const nodes = Array.from(Editor.nodes(editor, { at: [] }));

        if (nodes.length < 1) return;

        for (let i = 0; i < nodes.length; i++) {
            const [node, selection] = nodes[i];
            if (op.get(node, 'id') === ID) {
                return selection;
            }
        }
    };

    return e => {
        e.preventDefault();
        const selection = getSelection(id);

        if (!selection) return;
        Transforms.removeNodes(editor, { at: selection });
        ReactEditor.focus(editor);
    };
};

const DeleteButton = ({ onClick }) => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button
            appearance='circle'
            color='danger'
            className='delete-btn'
            onClick={onClick}>
            <Icon name='Feather.X' />
        </Button>
    );
};

Reactium.Plugin.register('shortcodes', 1).then(() => {
    // RTE Plugin
    Reactium.RTE.Plugin.register('shortcode', ShortcodeRTE);

    Reactium.Component.register('ShortcodeTextEditor', ({ children }) => {
        const { id } = op.get(children, 'props.node');

        const onDelete = useDelete(id);

        return (
            <span className='rte-shortcode strong' contentEditable={false}>
                {children}
                <DeleteButton onClick={onDelete} />
            </span>
        );
    });

    Reactium.Component.register('ShortcodeLinkEditor', ({ children }) => {
        const { id, shortcode } = op.get(children, 'props.node');
        let { attributes = {}, code } = shortcode;

        const onDelete = useDelete(id);

        code = String(code).replace(/\[|\]/gm, '');
        attributes = _.compact(
            Object.entries(attributes).map(([key, value]) =>
                !value ? null : `${key}="${value}"`,
            ),
        );

        return (
            <span className='rte-shortcode' contentEditable={false}>
                <strong>[{code}</strong>
                {attributes.length > 0 ? (
                    <kbd>{' ' + attributes.join(' ')}</kbd>
                ) : (
                    ''
                )}
                <strong>]</strong>
                <DeleteButton onClick={onDelete} />
            </span>
        );
    });

    SDK.Component.register('ShortcodeText', {
        component: 'ShortcodeText', // ID of a registered component. Used in the front end when this shortcode is replaced.
        editorComponent: 'ShortcodeTextEditor', // ID of a registered component. Used in the RTE when this shortcode is selected.
        label: 'Text', // String|Node used in the dropdown.
        order: -1, // Order used when listing in dropdown.
        attributes: undefined, // Hash of attributes used in the content editor when adding a shortcode to content
        validate: undefined, // Validation function See EventForm validate property
    });

    SDK.Component.register('ShortcodeLink', {
        component: 'ShortcodeLink',
        editorComponent: 'ShortcodeLinkEditor',
        label: 'Link',
        attributes: {
            url: {
                type: 'text',
                label: 'URL',
                placeholder: 'http://yoururlhere.com',
            },
            target: { type: 'text', label: 'Target', placeholder: '_blank' },
            text: {
                type: 'text',
                label: 'Text',
                placeholder: __('click here'),
            },
        },
    });

    Reactium.Zone.addComponent({
        id: 'SHORTCODES-BREADCRUMBS',
        zone: ['admin-header'],
        component: Breadcrumbs,
        order: 0,
    });

    Reactium.Zone.addComponent({
        id: 'SHORTCODES-SAVE-WIDGET',
        zone: ['admin-logo'],
        component: SaveWidget,
        order: 100,
    });

    Reactium.Zone.addComponent({
        id: 'SHORTCODES-SIDEBAR-WIDGET',
        zone: ['admin-sidebar-menu'],
        component: SidebarWidget,
        order: 401,
    });

    // Reactium SDK calls here
    Reactium.Zone.addComponent({
        id: 'SHORTCODES-EDITOR',
        zone: ['admin-shortcodes'],
        component: Shortcodes,
        order: 0,
    });

    // Settings Capabilites
    Reactium.Capability.Settings.register('shortcodes-retrieve', {
        zone: 'app-settings',
        capability: 'shortcodes.retrieve',
        title: __('Shortcodes: Retrieve'),
        tooltip: __('Able to view Shortcodes page when logged in.'),
    });

    Reactium.Capability.Settings.register('shortcodes-create', {
        zone: 'app-settings',
        capability: 'shortcodes.create',
        title: __('Shortcodes: Create'),
        tooltip: __('Able to create Shortcodes when logged in.'),
    });

    Reactium.Capability.Settings.register('shortcodes-update', {
        zone: 'app-settings',
        capability: 'shortcodes.update',
        title: __('Shortcodes: Update'),
        tooltip: __('Able to update Shortcodes when logged in.'),
    });

    Reactium.Capability.Settings.register('shortcodes-delete', {
        zone: 'app-settings',
        capability: 'shortcodes.delete',
        title: __('Shortcodes: Delete'),
        tooltip: __('Able to delete Shortcodes when logged in.'),
    });
});
