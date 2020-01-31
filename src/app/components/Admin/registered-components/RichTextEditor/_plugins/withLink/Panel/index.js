import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import EventForm from '../../../EventForm';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Transforms } from 'slate';
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

let Panel = ({ buttonLabel, children, selection, title, ...props }, ref) => {
    const formRef = useRef();

    const editor = useSlate();

    // Initial state

    const [value, setValue] = useState({});

    // className prefixer
    const cx = cls =>
        _.chain([op.get(props, 'className', op.get(props, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const _onSubmit = async e => {
        const { url } = e.value;

        if (!url) return;

        console.log(url);

        // const { id: type, label: text } = op.get(state, 'textStyle');
        //
        // if (!type) { return; }
        //
        // editor.focusEnd();
        //
        // ReactEditor.focus(editor);
        //
        // const node = {
        //     type,
        //     style,
        //     children: [{
        //         style,
        //         text
        //     }]
        // };
        //
        // editor.insertNode(node);
        // Transforms.select(editor, editor.lastLine());

        hide();
    };

    const hide = () => {
        editor.panel.hide().setContent(null);
        ReactEditor.focus(editor);
        Transforms.select(editor, selection);
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
    });

    // Renderers
    const render = () => {
        return (
            <EventForm ref={formRef} className={cx()}>
                <Dialog
                    header={{
                        title,
                        elements: [
                            <Button
                                onClick={() => hide()}
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
                    <div className='p-xs-8'>
                        <Button block color='primary' size='sm' type='submit'>
                            {buttonLabel}
                        </Button>
                    </div>
                </Dialog>
            </EventForm>
        );
    };

    return render();
};

Panel = forwardRef(Panel);

Panel.propTypes = {
    buttonLabel: PropTypes.node,
    className: PropTypes.string,
    namespace: PropTypes.string,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'rte-link-insert',
    title: __('Link'),
    buttonLabel: __('Insert Link'),
};

export { Panel as default };
