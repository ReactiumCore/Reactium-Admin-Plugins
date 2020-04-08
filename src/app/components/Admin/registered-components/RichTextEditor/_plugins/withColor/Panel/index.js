import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { ColorSelect } from '../../withFormatter/Panel/ColorSelect';
import { Button, Dialog, EventForm, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, {
    __,
    useDerivedState,
    useEventHandle,
    useFocusEffect,
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
        color: initialColor,
        selection: initialSelection,
        title,
        ...props
    },
    ref,
) => {
    const formRef = useRef();

    const editor = useSlate();

    const [state, setNewState] = useDerivedState({
        color: initialColor,
        colors: editor.colors,
        selection: initialSelection,
        value: {},
    });

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    // className prefixer
    const cx = cls =>
        _.chain([op.get(props, 'className', op.get(props, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const isColorActive = () => {
        const [color] = Editor.nodes(editor, {
            match: n =>
                n.type === 'color' && op.get(n, 'style.color') !== 'inherit',
        });
        return !!color;
    };

    const unMounted = () => !formRef.current;

    const unwrapColor = () => {
        Transforms.unwrapNodes(editor, { match: n => n.type === 'color' });
    };

    const wrapColor = () => {
        if (isColorActive()) {
            unwrapColor();
        }

        const { color, selection } = state;

        const isCollapsed = selection && Range.isCollapsed(selection);

        const [_node] = Editor.node(editor, selection);

        const text = op.get(_node, 'text');

        const node = {
            type: 'color',
            style: { color },
            children: [{ text }],
        };

        if (isCollapsed) {
            Transforms.insertNodes(editor, node, { at: selection });
        } else {
            Transforms.wrapNodes(editor, node, { split: true, at: selection });
        }

        editor.updated = Date.now();
    };

    const _onClearColor = e => {
        hide();
        _.defer(() => unwrapColor(), 1);
    };

    const _onChange = e => setState({ color: e.target.value });

    const _onSelect = e => setState({ color: e.item.value });

    const _onSubmit = e => {
        if (unMounted()) return;
        if (!state.color) return;
        wrapColor();
        hide();
    };

    const hide = () => {
        editor.panel.hide(false).setID('rte-panel');
    };

    // Handle
    // const _handle = () => ({});
    //
    // const [handle, setHandle] = useEventHandle(_handle());
    //
    // useImperativeHandle(ref, () => handle, [handle]);

    // On submit handler
    useEffect(() => {
        formRef.current.addEventListener('submit', _onSubmit);

        return () => {
            formRef.current.removeEventListener('submit', _onSubmit);
        };
    }, [editor, state.selection]);

    // Set selection
    useEffect(() => {
        if (!editor.selection) return;
        setState({ selection: editor.selection });
    }, [editor.selection]);

    // Set colors
    useEffect(() => {
        setState({ colors: editor.colors });
    }, [editor.colors]);

    useFocusEffect(editor.panel.container);

    // Renderers
    const render = () => {
        const isActive = isColorActive();
        const { color, colors, selection } = state;

        return (
            <EventForm ref={formRef} className={cx()} controlled>
                <Dialog
                    collapsible={false}
                    dismissable={false}
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
                    }}>
                    {!isActive && (
                        <ColorSelect
                            color={color}
                            colors={colors}
                            data-focus
                            name='color'
                            onColorChange={_onChange}
                            onColorSelect={_onSelect}
                            title={null}
                        />
                    )}
                    <div className='p-xs-8'>
                        {isActive ? (
                            <Button
                                block
                                color='danger'
                                data-focus
                                size='sm'
                                type='button'
                                onClick={_onClearColor}>
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
    color: PropTypes.string,
    namespace: PropTypes.string,
    removeButtonLabel: PropTypes.node,
    submitButtonLabel: PropTypes.node,
    title: PropTypes.string,
};

Panel.defaultProps = {
    color: '#000000',
    namespace: 'rte-color-insert',
    removeButtonLabel: __('Remove Color'),
    submitButtonLabel: __('Apply Color'),
    title: __('Text color'),
};

export { Panel as default };
