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
        const node = {
            type: 'block',
            id: `block-${uuid()}`,
            blocked: true,
            children: [
                {
                    type: 'image',
                    src: url,
                    blocked: true,
                    objectId,
                    id: uuid(),
                    ext: url.split('.').pop(),
                    children: [{ text: '' }],
                },
            ],
        };
        editor.insertNode(node);
    };

    const showPicker = () => {
        Modal.show(
            <MediaPicker
                confirm={false}
                dismissable
                filters='IMAGE'
                onSubmit={_onMediaSelect}
                onDismiss={() => Modal.hide()}
                title={__('Select Image')}
            />,
        );
    };

    return (
        <Button
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}
            onClick={() => showPicker()}
            data-tooltip={__('Add Image')}
            data-align='right'
            data-vertical-align='middle'
            {...props}>
            <Icon name='Feather.Camera' size={20} />
        </Button>
    );
};
