import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import React, { forwardRef, useRef, useState } from 'react';
import Reactium, { __, useFocusEffect } from 'reactium-core/sdk';
import { Button, Dialog, EventForm, Icon } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */

let Panel = (
    {
        children,
        removeButtonLabel,
        submitButtonLabel,
        title,
        url,
        selection,
        ...props
    },
    ref,
) => {
    const inputRef = useRef();

    const editor = useSlate();

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

        const isExpanded = selection && !Range.isCollapsed(selection);

        const link = {
            type: 'link',
            href: url,
        };

        if (isExpanded) {
            Transforms.wrapNodes(editor, link, {
                split: true,
                at: selection,
            });
            Transforms.collapse(editor, { edge: 'end' });
        }

        ReactEditor.focus(editor);
    };

    const _onClearLink = e => {
        hide();
        setTimeout(() => unwrapLink(), 1);
    };

    const _onSubmit = e => {
        wrapLink(inputRef.current.value);
        hide();
    };

    const hide = () => {
        editor.panel.hide(false).setID('rte-panel');
        ReactEditor.focus(editor);
    };

    useFocusEffect(editor.panel.container);

    // Renderers
    const render = () => {
        const isActive = isLinkActive();
        return (
            <div className={cx()}>
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
                                    data-focus
                                    type='text'
                                    ref={inputRef}
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
                                data-focus
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
                                onClick={_onSubmit}
                                size='sm'
                                type='button'>
                                {submitButtonLabel}
                            </Button>
                        )}
                    </div>
                </Dialog>
            </div>
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
