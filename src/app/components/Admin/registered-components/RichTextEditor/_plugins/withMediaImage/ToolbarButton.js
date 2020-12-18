import React, { useState, useEffect } from 'react';
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

    const [selection, setSelection] = useState(props.editor.selection);

    const Modal = op.get(tools, 'Modal');

    const _onMediaSelect = e => {
        let sel = e.selection;
        sel = Array.isArray(sel) ? sel : [sel];
        const item = _.last(sel);

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

        Reactium.RTE.insertBlock(editor, node, { id, at: selection });
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

    useEffect(() => {
        if (!props.editor.selection) return;
        if (_.isEqual(props.editor.selection, selection)) return;

        setSelection(props.editor.selection);
    }, [props.editor.selection]);

    return (
        <Button
            {...props}
            onClick={showPicker}
            data-tooltip={__('Add Image')}
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}>
            <Icon name='Feather.Camera' size={20} />
        </Button>
    );
};
