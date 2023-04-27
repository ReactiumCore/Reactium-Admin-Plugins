import React from 'react';
import BlockSettings from '../Settings';
import GridSettings from '../../withGrid/Panel';
import { __, useHookComponent } from 'reactium-core/sdk';

export const BlockCopyButton = ({ handle, node }) => {
    const { inspector, column } = node;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const _onClick = () => handle.copy();

    return inspector === false || column ? null : (
        <Button onClick={_onClick} title={__('Copy to Clipboard')}>
            <Icon name='Feather.Clipboard' size={14} />
        </Button>
    );
};

export const BlockDeleteButton = ({ handle, node }) => {
    let { deletable } = node;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const _onClick = () => handle.delete();

    return deletable === false ? null : (
        <Button onClick={_onClick} title={__('Delete Section')}>
            <Icon name='Feather.X' size={16} />
        </Button>
    );
};

export const BlockDuplicateButton = ({ handle }) => {
    const { selection: path } = handle.node();

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const _onClick = () => handle.duplicate();

    return path.length > 1 ? null : (
        <Button onClick={_onClick} title={__('Duplicate Section')}>
            <Icon name='Feather.Copy' size={14} />
        </Button>
    );
};

export const BlockSettingsButton = ({ editor, handle, node }) => {
    const { inspector, column } = node;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const _onClick = () => {
        const { node, selection: path } = handle.node();

        handle.showDialog(
            { editor, id: node.id },
            <BlockSettings
                node={node}
                path={path}
                id={node.id}
                selection={editor.selection}
            />,
        );
    };

    return inspector === false || column ? null : (
        <Button onClick={_onClick} title={__('Property Inspector')}>
            <Icon name='Feather.Settings' size={14} />
        </Button>
    );
};

export const GridSettingsButton = ({ editor, handle, node }) => {
    const { id, row } = node;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const _onClick = () => {
        const { node, selection: path } = handle.node();

        handle.showDialog(
            { editor, id: node.id },
            <GridSettings
                id={id}
                node={node}
                path={path}
                columns={row}
                selection={editor.selection}
            />,
        );
    };

    return !row ? null : (
        <Button onClick={_onClick} title={__('Grid Properties')}>
            <Icon name='Feather.Layout' size={14} />
        </Button>
    );
};

// Set button order
BlockCopyButton.order = 10;
BlockDuplicateButton.order = 12;
BlockSettingsButton.order = 14;
BlockDeleteButton.order = 1000;

// Set buttons to left zone
BlockCopyButton.zones = ['block-actions-right'];
BlockDeleteButton.zones = ['block-actions-right'];
BlockSettingsButton.zones = ['block-actions-right'];
BlockDuplicateButton.zones = ['block-actions-right'];

// Set buttons to right zone
GridSettingsButton.zones = ['block-actions-left'];
