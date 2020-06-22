import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import PropTypes from 'prop-types';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Transforms } from 'slate';
import {
    Button,
    Dialog,
    EventForm,
    Icon,
    Modal as ModalComp,
} from '@atomic-reactor/reactium-ui';
import Reactium, {
    __,
    useFocusEffect,
    useHandle,
    useHookComponent,
} from 'reactium-core/sdk';

import React, { forwardRef, useEffect, useRef, useState } from 'react';

const TYPE = 'video';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */
const CloseButton = props => (
    <Button
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.CLEAR}
        className='ar-dialog-header-btn dismiss'
        {...props}>
        <Icon name='Feather.X' />
    </Button>
);

let Panel = ({
    submitButtonLabel,
    placeholder,
    selection: initialSelection,
    title,
    ...props
}) => {
    const modalRef = useRef();

    const tools = useHandle('AdminTools');

    const [Modal, setNewModal] = useState();

    const MediaPicker = useHookComponent('MediaPicker');

    const formRef = useRef();

    const editor = useSlate();

    // Initial state
    const [, setPicker] = useState();

    const [selection, setSelection] = useState(initialSelection);

    const [value] = useState({});

    // className prefixer
    const cx = cls =>
        _.chain([op.get(props, 'className', op.get(props, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const showPicker = () => {
        hide(false);
        Modal.show(
            <MediaPicker
                confirm={false}
                dismissable
                filter='video'
                onChange={_onMediaSelect}
                onDismiss={() => Modal.hide()}
                ref={elm => setPicker(elm)}
                title={submitButtonLabel}
            />,
        );
    };

    const insertNode = (url, objectId, poster) => {
        const ext = url.split('.').pop();
        const node = {
            ID: uuid(),
            children: [{ text: '' }],
            ext,
            objectId,
            poster,
            src: url,
            type: TYPE,
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
            Transforms.removeNodes(editor, { at: parentPath, voids: true });
        } else {
            if (currentNode) {
                const text = _.compact([currentNode.text]);
                if (_.isEmpty(text)) editor.deleteBackward('block');
            }
            editor.insertNode(node);
            editor.insertNode(p);
        }
        hide();
    };

    const _onMediaSelect = e => {
        const value = Object.values(op.get(e, 'value', {}));
        const item = value.length > 0 ? value[0] : {};
        const { objectId, url } = item;

        let poster = op.get(item, 'thumbnail');
        poster = poster ? Reactium.Media.url(poster) : poster;

        Modal.hide();

        setTimeout(() => {
            insertNode(url, objectId, poster);
        }, 250);
    };

    const _onSubmit = e => {
        const url = op.get(e.value, 'url');
        if (!url) return;
        insertNode(url);
    };

    const hide = (focus = true) => {
        editor.panel.hide(false).setID('rte-panel');
        if (focus !== true) return;
        ReactEditor.focus(editor);
    };

    const setModal = element => {
        modalRef.current = element;
        setNewModal(element);
    };

    // On submit handler
    useEffect(() => {
        if (!formRef.current) return;
        formRef.current.addEventListener('submit', _onSubmit);

        return () => {
            formRef.current.removeEventListener('submit', _onSubmit);
        };
    }, [selection]);

    useEffect(() => {
        if (Modal || !modalRef.current) return;
        if (Modal !== modalRef.current) setModal(modalRef.current);
    }, [modalRef.current]);

    useEffect(() => {
        if (!tools) return;
        if (Modal !== op.get(tools, 'Modal')) setModal(tools.Modal);
    }, [tools]);

    useEffect(() => {
        if (editor.selection) {
            setSelection(editor.selection);
        }
    }, [editor.selection]);

    useFocusEffect(editor.panel.container);

    // Renderers
    const render = () => {
        const header = {
            elements: [<CloseButton key='close-button' onClick={hide} />],
            title,
        };

        return (
            <EventForm ref={formRef} className={cx()} value={value}>
                <Dialog collapsible={false} dismissable={false} header={header}>
                    <div className='p-xs-20'>
                        <div className='input-group'>
                            <input
                                type='text'
                                name='url'
                                placeholder={placeholder}
                            />
                            <Button
                                color='tertiary'
                                type='submit'
                                size='sm'
                                style={{ width: 40, padding: 0 }}>
                                <Icon name='Feather.DownloadCloud' size={20} />
                            </Button>
                        </div>
                    </div>
                    <hr />
                    <div className='p-xs-8'>
                        <Button
                            block
                            color='tertiary'
                            data-focus
                            size='sm'
                            type='button'
                            onClick={showPicker}>
                            {submitButtonLabel}
                        </Button>
                    </div>
                </Dialog>
                {!tools && <ModalComp ref={modalRef} />}
            </EventForm>
        );
    };

    return render();
};

Panel.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    placeholder: PropTypes.string,
    submitButtonLabel: PropTypes.node,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'rte-video-insert',
    placeholder: __('URL or Select Video'),
    submitButtonLabel: __('Select Video'),
    title: __('Video'),
};

export { Panel as default };
