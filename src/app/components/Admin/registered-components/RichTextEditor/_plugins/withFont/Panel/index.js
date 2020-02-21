import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { FontSelect } from '../../withFormatter/Panel/FontSelect';
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
        fontFamily: initialFontFamily,
        fontSize: initialFontSize,
        fontWeight: initialFontWeight,
        selection: initialSelection,
        title,
        ...props
    },
    ref,
) => {
    const formRef = useRef();

    const editor = useSlate();

    // Initial state
    const [fonts, setFonts] = useState();

    const [fontFamily, setFontFamily] = useState();

    const [fontSize, setFontSize] = useState();

    const [fontWeight, setFontWeight] = useState();

    const [selection, setSelection] = useState(initialSelection);

    // className prefixer
    const cx = cls =>
        _.chain([op.get(props, 'className', op.get(props, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const isNodeActive = () => {
        const [_font] = Editor.nodes(editor, {
            match: n => n.type === 'font',
        });
        return !!_font;
    };

    const unwrapNode = () => {
        Transforms.unwrapNodes(editor, { match: n => n.type === 'font' });
    };

    const wrapNode = () => {
        if (isNodeActive()) {
            unwrapNode();
        }

        const isCollapsed = selection && Range.isCollapsed(selection);

        const [_node] = Editor.node(editor, selection);

        const text = op.get(_node, 'text');

        const node = {
            type: 'font',
            style: {},
            children: [{ text }],
        };

        if (fontFamily) {
            node.style.fontFamily = op.get(fontFamily, 'weight.0.family');
        }

        if (fontWeight) {
            node.style.fontWeight = op.get(fontWeight, 'weight');
        }

        if (fontSize) {
            node.style.fontSize = op.get(fontSize, 'value', 16);
        }

        if (isCollapsed) {
            Transforms.insertNodes(editor, node, { at: selection });
        } else {
            Transforms.wrapNodes(editor, node, { split: true, at: selection });
        }

        editor.updated = Date.now();
    };

    const _onClear = e => {
        hide();
        setTimeout(() => unwrapNode(), 1);
    };

    const _onChange = e => setColor(e.target.value);

    const _onFontSelect = e => setFontFamily(e.item);

    const _onSizeSelect = e => setFontSize(e.item);

    const _onWeightSelect = e => setFontWeight(e.item);

    const _onSubmit = e => {
        wrapNode();
        hide();
    };

    const hide = () => editor.panel.setID('rte-panel').hide(false, true);

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
    }, [formRef.current]);

    useEffect(() => {
        if (!editor.selection) return;
        setSelection(editor.selection);
    }, [editor.selection]);

    // Set fonts
    useEffect(() => {
        if (!editor.fonts) return;
        setFonts(_.sortBy(editor.fonts, 'label'));
    }, [editor.fonts]);

    useEffect(() => {
        if (!fonts) return;

        if (!fontFamily || !fontSize || !fontWeight) {
            const font = fonts[0];

            if (!fontFamily) setFontFamily(font);
            if (!fontSize) setFontSize({ label: 16, value: 16 });
            if (!fontWeight) setFontWeight(font.weight[0]);
        }
    }, [fonts]);

    const [focused] = useFocusEffect(op.get(formRef, 'current.form'), [
        op.get(formRef, 'current.form'),
    ]);
    const [focusRetry, setFocusRetry] = useState(0);

    useEffect(() => {
        if (!focused && focusRetry < 10) setFocusRetry(focusRetry + 1);
    }, [focusRetry]);

    // Renderers
    const render = () => {
        if (!fontFamily || !fontSize || !fontWeight) return null;

        const isActive = isNodeActive();

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
                        <FontSelect
                            data-focus
                            font={fontFamily}
                            fonts={fonts}
                            onFontSelect={_onFontSelect}
                            onSizeSelect={_onSizeSelect}
                            onWeightSelect={_onWeightSelect}
                            size={fontSize}
                            weight={fontWeight}
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
                                onClick={_onClear}>
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
    fontFamily: PropTypes.string,
    fontSize: PropTypes.number,
    fontWeight: PropTypes.number,
    namespace: PropTypes.string,
    removeButtonLabel: PropTypes.node,
    submitButtonLabel: PropTypes.node,
    title: PropTypes.string,
};

Panel.defaultProps = {
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: 400,
    namespace: 'rte-color-insert',
    removeButtonLabel: __('Remove Font'),
    submitButtonLabel: __('Apply Font'),
    title: __('Font'),
};

export { Panel as default };
