import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import EventForm from '../../../EventForm';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Range, Transforms } from 'slate';
import { Button, Dialog, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, {
    __,
    useDerivedState,
    useEventHandle,
    useHandle,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */

let Panel = (
    {
        removeButtonLabel,
        submitButtonLabel,
        children,
        selection: initialSelection,
        title,
        ...props
    },
    ref,
) => {
    const formRef = useRef();

    const editor = useSlate();

    // Initial state
    const [selection, setSelection] = useState(initialSelection);

    const [value, setValue] = useState({});

    // className prefixer
    const cx = cls =>
        _.chain([op.get(props, 'className', op.get(props, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const isLinkActive = () => {
        const [link] = Editor.nodes(editor, { match: n => n.type === 'link' });
        return !!link;
    };

    const unwrapLink = () => {
        Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
    };

    const wrapLink = url => {
        if (isLinkActive()) {
            unwrapLink();
        }

        const isCollapsed = selection && Range.isCollapsed(selection);

        const link = {
            type: 'link',
            href: url,
            children: isCollapsed ? [{ text: url }] : [],
        };

        if (isCollapsed) {
            Transforms.insertNodes(editor, link, { at: selection });
        } else {
            Transforms.wrapNodes(editor, link, { split: true, at: selection });
            Transforms.collapse(editor, { edge: 'end' });
        }

        ReactEditor.focus(editor);
    };

    const _onSubmit = e => {
        const url = op.get(e.value, 'url');

        if (!url) return;

        wrapLink(url);
        hide();
    };

    const _onClearLink = e => {
        hide();
        setTimeout(() => unwrapLink(), 1);
    };

    const hide = () => {
        editor.panel.hide(false).setID('rte-panel');
        ReactEditor.focus(editor);
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
    }, [editor, selection]);

    // Renderers
    const render = () => {
        const isActive = isLinkActive();
        return (
            <EventForm ref={formRef} className={cx()}>
                <Dialog
                    header={{
                        title,
                        elements: [
                            <Button
                                onClick={e => {
                                    e.preventDefault();
                                    hide();
                                }}
                                size={Button.ENUMS.SIZE.XS}
                                color={Button.ENUMS.COLOR.CLEAR}
                                className='ar-dialog-header-btn dismiss'>
                                <Icon name='Feather.X' />
                            </Button>,
                        ],
                    }}
                    pref='admin.dialog.formatter'
                    collapsible={false}
                    dismissable={false}>
                    {!isActive && (
                        <div className='p-xs-20'>
                            <div className='form-group'>
                                <input
                                    type='text'
                                    name='url'
                                    placeholder='http://site.com/page'
                                />
                                <Icon name='Feather.Link' />
                            </div>
                        </div>
                    )}
                    {!isActive && <hr />}
                    <div className='p-xs-8'>
                        {isActive ? (
                            <Button
                                block
                                color='danger'
                                className='mt-xs-8'
                                size='sm'
                                type='button'
                                onClick={_onClearLink}>
                                {removeButtonLabel}
                            </Button>
                        ) : (
                            <Button
                                block
                                color='primary'
                                size='sm'
                                type='submit'>
                                {submitButtonLabel}
                            </Button>
                        )}
                    </div>
                </Dialog>
            </EventForm>
        );
    };

    return render();
};

Panel = forwardRef(Panel);

Panel.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    removeButtonLabel: PropTypes.node,
    submitButtonLabel: PropTypes.node,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'rte-link-insert',
    removeButtonLabel: __('Remove Link'),
    submitButtonLabel: __('Insert Link'),
    title: __('Link'),
};

export { Panel as default };
