import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { FontSelect } from '../../withFormatter/Panel/FontSelect';
import { Button, Dialog, EventForm, Icon } from 'reactium-ui';
import Reactium, {
    __,
    useDerivedState,
    useFocusEffect,
    useFulfilledObject,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */

let Panel = (
    { removeButtonLabel, submitButtonLabel, children, title, ...props },
    ref,
) => {
    const formRef = useRef();

    const editor = useSlate();

    // Initial state
    const [state, setNewState] = useDerivedState({
        ...props,
        fonts: _.sortBy(editor.fonts, 'label'),
        selection: editor.selection,
    });

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const [ready, readyObj] = useFulfilledObject(state, [
        'fonts',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'selection',
    ]);

    // className prefixer
    const cx = cls =>
        _.chain([op.get(props, 'className', op.get(props, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const initialize = () => {
        if (!state.fonts) return;

        const { fonts, fontFamily, fontSize, fontWeight } = state;

        const newState = {};
        const font = fonts[0];

        if (!fontFamily) op.set(newState, 'fontFamily', font);
        if (!fontSize) op.set(newState, 'fontSize', { label: 16, value: 16 });
        if (!fontWeight) op.set(newState, 'fontWeight', font.weight[0]);

        if (Object.keys(newState).length > 0) setState(newState);
    };

    const isNodeActive = () => {
        const [_font] = Editor.nodes(editor, {
            match: n => n.type === 'font',
        });
        return !!_font;
    };

    const unMounted = () => !formRef.current;

    const unwrapNode = () => {
        Transforms.unwrapNodes(editor, { match: n => n.type === 'font' });
    };

    const wrapNode = () => {
        if (isNodeActive()) {
            unwrapNode();
        }

        const { fontFamily, fontSize, fontWeight, selection } = state;

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

    const _onFontSelect = e => setState({ fontFamily: e.item });

    const _onSizeSelect = e => setState({ fontSize: e.item });

    const _onWeightSelect = e => setState({ fontWeight: e.item });

    const _onSubmit = () => {
        if (unMounted()) return;
        wrapNode();
        hide();
    };

    const hide = () => editor.panel.setID('rte-panel').hide(false, true);

    useEffect(() => {
        if (!editor.selection) return;
        setState({ selection: editor.selection });
    }, [editor.selection]);

    // Set fonts
    useEffect(() => {
        if (!editor.fonts) return;
        setState({ fonts: _.sortBy(editor.fonts, 'label') });
    }, [editor.fonts]);

    useEffect(() => {
        initialize();
    }, [state.fonts]);

    const [focused] = useFocusEffect(formRef.current, [formRef.current]);
    const [focusRetry, setFocusRetry] = useState(0);

    useLayoutEffect(() => {
        if (!ready) return;
        if (!focused && focusRetry < 10) setFocusRetry(focusRetry + 1);
    }, [ready, focusRetry]);

    // Renderers
    const render = () => {
        const { fonts, fontFamily, fontSize, fontWeight } = state;

        const isActive = isNodeActive();

        return (
            <div ref={formRef} className={cx()}>
                {ready && (
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
                                    onClick={_onSubmit}
                                    size='sm'
                                    type='button'>
                                    {submitButtonLabel}
                                </Button>
                            )}
                        </div>
                    </Dialog>
                )}
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
    namespace: 'rte-color-insert',
    removeButtonLabel: __('Remove Font'),
    submitButtonLabel: __('Apply Font'),
    title: __('Font'),
    value: {},
};

export { Panel as default };
