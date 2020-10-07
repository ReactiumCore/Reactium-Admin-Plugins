import React from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import { useEditor } from 'slate-react';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const editor = useEditor();
    const tools = useHandle('AdminTools');
    const MediaPicker = useHookComponent('MediaPicker');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const Modal = op.get(tools, 'Modal');

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
            blockID: `block-${id}`,
            blocked: true,
            children: [{ text: '' }],
            ext: url.split('.').pop(),
            id: id,
            objectId,
            src: url,
            type: 'image',
        };

        Reactium.RTE.insertBlock(editor, node, { id });
    };

    const showPicker = () =>
        Modal.show(
            <MediaPicker
                confirm={false}
                dismissable
                filters='IMAGE'
                onDismiss={() => Modal.hide()}
                onSubmit={_onMediaSelect}
                title={__('Select Image')}
            />,
        );

    return (
        <Button
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}
            onClick={() => showPicker()}
            data-tooltip={__('Add Image')}
            {...props}>
            <Icon name='Feather.Camera' size={20} />
        </Button>
    );
};
