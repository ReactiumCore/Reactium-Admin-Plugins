import React from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import PropTypes from 'prop-types';
import { useEditor } from 'slate-react';
import { useEditorSelection } from './_utils';
import Reactium, { useHandle, useHookComponent } from 'reactium-core/sdk';

const MediaInsert = ({ icon, title, tooltip, type, ...props }) => {
    const editor = useEditor();
    const tools = useHandle('AdminTools');
    const MediaPicker = useHookComponent('MediaPicker');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const Modal = op.get(tools, 'Modal');

    const [selection] = useEditorSelection();

    const _onMediaSelect = e => {
        const item = _.last(e.selection);
        if (!item) return;

        const { objectId, url } = item;

        Modal.hide();

        insertNode(url, objectId);
    };

    const insertNode = (url, objectId) => {
        const id = uuid();
        const node = {
            type,
            id: id,
            objectId,
            src: url,
            blocked: true,
            blockID: `block-${id}`,
            children: [{ text: '' }],
        };

        Reactium.RTE.insertBlock(editor, node, { id, at: selection });
    };

    const showPicker = () =>
        Modal.show(
            <MediaPicker
                dismissable
                title={title}
                confirm={false}
                onSubmit={_onMediaSelect}
                onDismiss={() => Modal.hide()}
                filters={String(type).toUpperCase()}
            />,
        );

    return (
        <Button
            {...props}
            data-tooltip={tooltip}
            onClick={() => showPicker()}
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}>
            <Icon name={icon} size={20} />
        </Button>
    );
};

MediaInsert.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.node,
    tooltip: PropTypes.string,
    type: PropTypes.string,
};

export default MediaInsert;
