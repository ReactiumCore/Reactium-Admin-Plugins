import React from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import { useEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
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

        let poster = op.get(item, 'thumbnail');
        poster = poster ? Reactium.Media.url(poster) : poster;

        Modal.hide();

        insertNode(url, objectId, poster);
    };

    const insertNode = (url, objectId, poster) => {
        const selection = editor.selection;

        const ext = url.split('.').pop();
        const node = {
            ID: uuid(),
            children: [{ text: '' }],
            ext,
            objectId,
            poster,
            src: url,
            type: 'video',
        };

        const p = {
            type: 'p',
            ID: uuid(),
            children: [{ text: '' }],
        };

        const [currentNode] = Editor.node(editor, selection);
        const [parentNode, parentPath] = Editor.parent(editor, selection);

        let type = op.get(parentNode, 'type');
        type = String(type).toLowerCase();

        if (type === 'col') {
            const parentProps = { ...parentNode };
            delete parentProps.children;

            const currentText = op.get(currentNode, 'text', '');

            const children = [];

            if (!_.isEmpty(_.compact([currentText]))) {
                children.push({
                    children: [{ text: currentText }],
                });
            }
            children.push(node);
            children.push(p);
            const newParent = { ...parentProps, children };
            editor.insertNode(newParent);
            Transforms.wrapNodes(editor, parentProps);
            Transforms.removeNodes(editor, {
                at: parentPath,
                voids: true,
            });
        } else {
            if (currentNode) {
                const text = _.compact([currentNode.text]);
                if (_.isEmpty(text)) editor.deleteBackward('block');
            }
            editor.insertNode(node);
            editor.insertNode(p);
        }
    };

    const showPicker = () => {
        Modal.show(
            <MediaPicker
                confirm={false}
                dismissable
                filters='VIDEO'
                onSubmit={_onMediaSelect}
                onDismiss={() => Modal.hide()}
                title={__('Select Video')}
            />,
        );
    };

    return (
        <Button
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}
            onClick={() => showPicker()}
            {...props}>
            <Icon name='Feather.Film' size={20} />
        </Button>
    );
};
