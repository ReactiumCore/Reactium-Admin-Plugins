import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { Button, Dialog, Icon } from '@atomic-reactor/reactium-ui';

import {
    __,
    useDerivedState,
    useEventHandle,
    useStatus,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

import { FontSelect } from './FontSelect';
import { ColorSelect } from './ColorSelect';
import { hexToRgb, rgbToHex } from './utils';
import { TextStyleSelect } from './TextStyleSelect';
import { TextAlignSelect } from './TextAlignSelect';

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

let Panel = ({ selection: initialSelection, ...props }, ref) => {
    const formRef = useRef();
    const editor = useSlate();

    const [, setVisible, isVisible] = useStatus(false);

    // Initial state
    const [state, setNewState] = useDerivedState({
        ...props,
        align: 'align-left',
        bgColor: 'transparent',
        blocks: _.where(editor.blocks, { formatter: true }),
        buttons: _.where(editor.buttons, item => op.has(item, 'formatter')),
        color: 'inherit',
        colors: editor.colors,
        focused: null,
        fonts: _.sortBy(editor.fonts, 'label'),
        opacity: 100,
        bgOpacity: 100,
        selection: initialSelection || editor.selection,
        size: { label: 16, value: 16 },
        style: {},
        value: {},
    });

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    // apply state to style
    const applyStyle = params => {
        const { style } = state;

        let {
            align,
            bgColor: backgroundColor,
            bgOpacity,
            color,
            font,
            opacity,
            size,
            weight,
        } = params;

        let newStyle = { ...style, padding: 0 };

        if (align) {
            newStyle = {
                ...newStyle,
                textAlign: String(align)
                    .split('align-')
                    .pop(),
            };
        }

        if (backgroundColor) {
            if (bgOpacity) {
                if (String(backgroundColor).substr(0, 1) === '#') {
                    const RGB = hexToRgb(backgroundColor).join(', ');
                    backgroundColor = `rgba(${RGB}, ${bgOpacity / 100}`;
                }
            }

            const padding =
                backgroundColor !== 'transparent' ? '0 10px' : undefined;
            newStyle = { ...newStyle, backgroundColor, padding };
        }

        if (color) {
            if (opacity) {
                if (String(color).substr(0, 1) === '#') {
                    const RGB = hexToRgb(color).join(', ');
                    color = `rgba(${RGB}, ${opacity / 100}`;
                }
            }

            newStyle = { ...newStyle, color };
        }

        if (font) {
            const { family: fontFamily } = op.get(font, ['weight', 0]);
            newStyle = { ...newStyle, fontFamily };
        }

        if (weight) {
            const { weight: fontWeight } = weight;
            newStyle = { ...newStyle, fontWeight };
        }

        if (size) {
            newStyle = { ...newStyle, fontSize: size.value };
        } else {
            newStyle = { ...newStyle, fontSize: 16 };
        }

        if (_.isEqual(newStyle, style)) return;

        setState({ style: newStyle });
    };

    // className prefixer
    const cx = cls =>
        _.chain([op.get(state, 'className', op.get(state, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const hide = () => {
        editor.panel.hide(false, true).setID('rte-panel');
        ReactEditor.focus(editor);
    };

    const styleToState = currentStyle => {
        let newState = {};

        // text align
        let textAlign = op.get(currentStyle, 'textAlign');
        if (textAlign) {
            op.set(newState, 'align', `align-${textAlign}`);
        }

        const _fonts = _.sortBy(editor.fonts, 'label');
        let _font = _fonts[0];

        // default font values
        newState = {
            ...newState,
            font: _font,
            size: { label: 16, value: 16 },
            weight: _font.weight[0],
        };

        // map font
        if (op.has(currentStyle, 'fontFamily')) {
            const label = op
                .get(currentStyle, 'fontFamily')
                .split(',')
                .shift();
            _font = _.findWhere(editor.fonts, { label }) || newState.font;

            newState = {
                ...newState,
                font: _font,
                weight: _font.weight[0],
            };
        }

        if (op.has(currentStyle, 'fontSize')) {
            const fontSize = op.get(currentStyle, 'fontSize');
            const size = { label: fontSize, value: fontSize };
            newState['size'] = size;
        }

        if (op.has(currentStyle, 'fontWeight')) {
            const fontWeight = Number(op.get(currentStyle, 'fontWeight', 400));
            const weights = newState.font;
            const weight = _.findWhere(weights, { weight: fontWeight });
            newState['weight'] = weight;
        }

        // map color values to state
        const colors = [
            {
                key: 'bgColor',
                opacity: 'bgOpacity',
                css: 'backgroundColor',
            },
            {
                key: 'color',
                opacity: 'opacity',
                css: 'color',
            },
        ];

        colors.forEach(({ key, opacity, css }) => {
            let clr = op.get(currentStyle, css);

            newState[key] = clr;

            if (clr && String(clr).substr(0, 3) === 'rgb') {
                clr = clr
                    .split('(')
                    .pop()
                    .split(')')
                    .shift()
                    .split(', ');

                newState[key] = rgbToHex(...clr);
                newState[opacity] =
                    Number(clr.length === 4 ? clr.pop() : 1) * 100;
            }
        });

        // Update state
        if (Object.keys(newState).length > 0 && !_.isEqual(state, newState)) {
            setState(newState);
        }
    };

    const unMounted = () => !formRef.current;

    const _onBgColorChange = e => {
        const bgColor = e.target.value;
        setState({ bgColor });
    };

    const _onBgColorSelect = e => {
        const { item } = e;
        setState({ bgColor: item.value });
    };

    const _onBgOpacityChange = e => {
        const bgOpacity = e.target.value;
        setState({ bgOpacity });
    };

    const _onFontSelect = e => {
        const { item: font } = e;
        setState({ font });
    };

    const _onTextColorChange = e => {
        const color = e.target.value;
        setState({ color });
    };

    const _onTextColorSelect = e => {
        const { item } = e;
        setState({ color: item.value });
    };

    const _onTextOpacityChange = e => {
        const opacity = e.target.value;
        setState({ opacity });
    };

    const _onTextStyleChange = e => {
        const { size: currentSize } = state;
        const { item: textStyle } = e;

        const size = op.get(textStyle, 'size')
            ? { label: textStyle.size, value: textStyle.size }
            : currentSize;

        setState({ size, textStyle });
    };

    const _onTextAlignChange = e => {
        //const align = e.currentTarget.dataset.align;
        const align = e.target.value;
        setState({ align });
    };

    const _onSizeSelect = e => {
        const { item: size } = e;
        setState({ size });
    };

    const _onWeightSelect = e => {
        const { item: weight } = e;
        setState({ weight });
    };

    const _onSubmit = () => {
        const { selection, style, textStyle } = state;
        Transforms.select(editor, selection);

        if (Range.isExpanded(selection)) {
            if (op.get(textStyle, 'id') !== 'styled') {
                Transforms.setNodes(
                    editor,
                    { style, type: textStyle.id },
                    { split: true },
                );
            } else {
                Editor.addMark(editor, 'style', style);
            }
        } else {
            Transforms.insertNodes(editor, {
                type: 'block',
                blocked: true,
                id: `block-${uuid()}`,
                children: [
                    {
                        style,
                        type: textStyle.id,
                        children: [{ text: textStyle.label || '' }],
                    },
                ],
            });
        }
        Transforms.collapse(editor, { edge: 'end' });
        hide();
    };

    // Handle
    const _handle = () => ({
        setState,
        state,
    });

    const [handle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);

    // Editor load
    useEffect(() => {
        const { blocks, selection } = state;
        if (blocks && selection) {
            const textStyle = _.findWhere(blocks, { id: 'styled' });

            setState({ textStyle });
        }
    }, [state.blocks, state.selection]);

    // Set blocks
    useEffect(() => {
        setState({ blocks: _.where(editor.blocks, { formatter: true }) });
    }, [editor.blocks]);

    // Set buttons
    useEffect(() => {
        setState({
            buttons: _.where(editor.buttons, item => op.has(item, 'formatter')),
        });
    }, [editor.buttons]);

    // Set colors
    useEffect(() => {
        setState({ colors: editor.colors });
    }, [editor.colors]);

    // Set fonts
    useEffect(() => {
        setState({ fonts: _.sortBy(editor.fonts, 'label') });
    }, [editor.fonts]);

    useEffect(() => {
        if (!state.fonts) return;
        if (!op.get(state, 'font')) {
            const font = state.fonts[0];
            const size = 16;

            setState({
                font,
                size: { label: size, value: size },
                weight: font.weight[0],
            });
        }
    }, [state.fonts]);

    // Set style on state changes
    useEffect(() => {
        applyStyle(state);
    }, [Object.values(state)]);

    // Get styles from current node
    useEffect(() => {
        const { selection } = state;
        if (!selection) return;

        let parent;
        try {
            parent = Editor.parent(editor, selection);
        } catch (err) {
            return;
        }

        if (!parent) return;

        const [currentNode] = parent;

        if (!currentNode) return;

        if (op.has(currentNode, 'style')) {
            let currentStyle = _.clone(op.get(currentNode, 'style', {}));
            styleToState(currentStyle);
        }

        setState({ node: currentNode });
    }, [state.node, state.selection]);

    // Update selection
    useEffect(() => {
        if (!editor.selection) return;
        if (_.isEqual(state.selection, editor.selection)) return;

        setState({ selection: editor.selection });
    }, [editor.selection]);

    // Move panel to center
    useEffect(() => {
        if (!editor.panel || !formRef.current) return;
        if (!isVisible(true)) {
            let { width, height } = formRef.current.getBoundingClientRect();

            width = width / 2;
            height = height / 2;

            let ox = window.innerWidth / 2;
            let oy = window.innerHeight / 2;
            let x = ox - width;
            let y = oy - height;
            x = Math.floor(x);
            y = Math.floor(y);

            editor.panel.moveTo(x, y);

            setVisible(true, true);
        }
    }, [editor.panel, formRef.current]);

    // Renderers
    const render = () => {
        const {
            align,
            bgColor,
            bgOpacity,
            blocks,
            buttons,
            color,
            colors,
            font,
            fonts,
            opacity,
            size,
            style,
            title,
            textStyle,
            weight,
        } = state;

        const header = {
            elements: [<CloseButton onClick={hide} key='close-btn' />],
            title,
        };

        return (
            <div ref={formRef} className={cx()}>
                <Dialog collapsible={false} dismissable={false} header={header}>
                    <TextStyleSelect
                        blocks={blocks}
                        onSelect={_onTextStyleChange}
                        style={style}
                        textStyle={textStyle}
                    />
                    <FontSelect
                        font={font}
                        fonts={_.sortBy(fonts, 'label')}
                        onFontSelect={_onFontSelect}
                        onSizeSelect={_onSizeSelect}
                        onWeightSelect={_onWeightSelect}
                        size={size}
                        weight={weight}
                        title={__('Font')}
                    />
                    <ColorSelect
                        color={color || '#000000'}
                        colors={colors}
                        inherit
                        onColorChange={_onTextColorChange}
                        onColorSelect={_onTextColorSelect}
                        onOpacityChange={_onTextOpacityChange}
                        opacity={opacity}
                        title={__('Text color')}
                    />
                    <ColorSelect
                        color={bgColor || '#FFFFFF'}
                        colors={colors}
                        onColorChange={_onBgColorChange}
                        onColorSelect={_onBgColorSelect}
                        onOpacityChange={_onBgOpacityChange}
                        opacity={bgOpacity}
                        title={__('Background color')}
                        transparent
                    />
                    <TextAlignSelect
                        value={align}
                        onChange={_onTextAlignChange}
                    />
                    <div className='p-xs-8'>
                        <Button
                            block
                            color='primary'
                            onClick={_onSubmit}
                            size='sm'
                            type='button'>
                            {__('Apply Formatting')}
                        </Button>
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
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'formatter',
    title: 'Text style',
};

export { Panel as default };
