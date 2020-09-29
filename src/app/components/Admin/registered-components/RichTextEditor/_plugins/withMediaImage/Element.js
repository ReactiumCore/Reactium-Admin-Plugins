import _ from 'underscore';
import op from 'object-path';
import { useEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
import React, { useEffect } from 'react';
import {
    __,
    useDerivedState,
    useHandle,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

const INIT = 'INIT';
const LOADING = 'LOADING';
const COMPLETE = 'COMPLETE';

export default ({ children, ...props }) => {
    const editor = useEditor();
    const tools = useHandle('AdminTools');

    const MediaPicker = useHookComponent('MediaPicker');
    const { Spinner } = useHookComponent('ReactiumUI');

    const [, setStatus, isStatus] = useStatus(INIT);

    const [state, setState] = useDerivedState({ src: null });

    const showPicker = () => {
        const Modal = op.get(tools, 'Modal');
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

    const _onMediaSelect = e => {
        const Modal = op.get(tools, 'Modal');

        const nodes = Editor.nodes(editor, {
            at: [],
            match: ({ id }) => id === props.id,
        });

        let node = _.first(Array.from(nodes));
        if (!node) {
            Modal.hide();
            return;
        }
        node = _.object(['node', 'path'], node);

        const item = _.last(e.selection);
        if (!item) {
            Modal.hide();
            return;
        }

        const { objectId, url } = item;

        Transforms.setNodes(editor, { objectId, src: url }, { at: node.path });
        Modal.hide();
    };

    const loadImage = url => {
        setStatus(LOADING, true);
        const img = new Image();
        img.addEventListener('load', () => {
            setStatus(COMPLETE);
            setState({ src: url });
        });
        img.src = url;
    };

    useEffect(() => {
        if (props.src === state.src) return;
        if (isStatus(LOADING)) return;
        loadImage(props.src);
    }, [props.src]);

    return (
        <div contentEditable={false} className='ar-rte-image'>
            {children}
            {isStatus(COMPLETE) ? (
                <img
                    src={state.src}
                    contentEditable={false}
                    onClick={showPicker}
                    style={{ userSelect: 'none' }}
                />
            ) : (
                <Spinner className='flex flex-center' />
            )}
        </div>
    );
};
