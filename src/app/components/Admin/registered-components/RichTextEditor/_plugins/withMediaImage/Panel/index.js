import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import EventForm from '../../../EventForm';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Range, Transforms } from 'slate';
import {
    Button,
    Dialog,
    Icon,
    Modal as ModalComp,
} from '@atomic-reactor/reactium-ui';
import Reactium, {
    __,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';

const TYPE = 'image';

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

let Panel = (
    {
        removeButtonLabel,
        submitButtonLabel,
        children,
        selection: initialSelection,
        title,
        url: initialUrl,
        ...props
    },
    ref,
) => {
    const modalRef = useRef();

    const tools = useHandle('AdminTools');

    const [Modal, setNewModal] = useState();

    const MediaPicker = useHookComponent('MediaPicker');

    const formRef = useRef();

    const editor = useSlate();

    // Initial state
    const [picker, setPicker] = useState();

    const [selection, setSelection] = useState(initialSelection);

    const [value, setValue] = useState({});

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
                filter='image'
                onChange={_onMediaSelect}
                onDismiss={() => Modal.hide()}
                ref={elm => setPicker(elm)}
                title={__('Select Image')}
            />,
        );
    };

    const insertNode = (url, objectId) => {
        const node = {
            type: TYPE,
            src: url,
            objectId,
            ID: uuid(),
            children: [{ text: '' }],
        };

        const p = {
            type: 'p',
            ID: uuid(),
            children: [{ text: '' }],
        };

        const [currentNode, currentNodeAt] = Editor.node(editor, selection);
        const [parentNode, parentPath] = Editor.parent(editor, selection);

        let type = op.get(parentNode, 'type');
        type = String(type).toLowerCase();

        if (type === 'col') {
            editor.insertNode(node);
            Transforms.wrapNodes(editor, parentNode);
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
        const file = op.get(item, 'file');
        if (!file) return;

        let url = Reactium.Media.url(file);
        url = String(url).includes('/localhost:') ? item.url : url;

        const { objectId } = item;

        Modal.hide();

        setTimeout(() => {
            insertNode(url, objectId);
        }, 250);
    };

    const _onSubmit = e => {
        const url = op.get(e.value, 'url');
        if (!url) return;
        insertNode(url);
    };

    const hide = (focus = true) => {
        editor.panel.hide(false).setID('rte-panel');
        //if (focus !== true) return;
        //ReactEditor.focus(editor);
    };

    const setModal = element => {
        modalRef.current = element;
        setNewModal(element);
    };

    // Handle
    const _handle = () => ({});

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

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

    // Renderers
    const render = () => {
        const header = {
            elements: [<CloseButton onClick={hide} />],
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
                                placeholder='URL or Select Image'
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

Panel = forwardRef(Panel);

Panel.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    submitButtonLabel: PropTypes.node,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'rte-image-insert',
    submitButtonLabel: __('Select Image'),
    title: __('Image'),
};

export { Panel as default };
