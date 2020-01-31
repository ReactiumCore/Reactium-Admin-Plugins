import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import EventForm from '../../../EventForm';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Transforms } from 'slate';
import { Button, Dialog, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, {
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

import { hexToRgb } from './utils';
import { FontSelect } from './FontSelect';
import { ColorSelect } from './ColorSelect';
import { TextStyleSelect } from './TextStyleSelect';
import { TextAlignSelect } from './TextAlignSelect';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */

let Panel = ({ children, ...props }, ref) => {
    const formRef = useRef();

    const editor = useSlate();

    // Initial state
    const [blocks, setBlocks] = useState(editor.blocks);

    const [buttons, setButtons] = useState(editor.buttons);

    const [colors, setColors] = useState(editor.colors);

    const [fonts, setFonts] = useState(editor.fonts);

    const [selection, setSelection] = useState();

    const [state, setState] = useDerivedState({
        ...props,
        align: 'align-left',
        color: 'inherit',
        bgColor: 'transparent',
        opacity: 100,
        bgOpacity: 100,
        size: { label: 16, value: 16 },
    });

    const [value, setValue] = useState({});

    const [style, setStyle] = useState({});

    // apply state to style
    const applyStyle = ({
        align,
        bgColor: backgroundColor,
        bgOpacity,
        color,
        font,
        opacity,
        size,
        weight,
    }) => {
        let newStyle = { ...style };

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

            newStyle = { ...newStyle, backgroundColor };
        }

        if (color) {
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

        setStyle(newStyle);
    };

    // classname and namespace
    const cname = () => {
        const { className, namespace } = state;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    // className prefixer
    const cx = cls =>
        _.chain([op.get(state, 'className', op.get(state, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

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

    const _onTextAlignClick = e => {
        const align = e.currentTarget.dataset.align;
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

    const _onSubmit = async e => {
        const { id: type, label: text } = op.get(state, 'textStyle');

        if (!type) {
            return;
        }

        editor.focusEnd();

        ReactEditor.focus(editor);

        const node = {
            type,
            style,
            children: [
                {
                    style,
                    text,
                },
            ],
        };

        editor.insertNode(node);
        Transforms.select(editor, editor.lastLine());
    };

    // Handle
    const _handle = () => ({
        setState,
        state,
    });

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

    // Editor load
    useEffect(() => {
        if (!selection || editor.refresh === true) {
            const sel = Editor.parent(editor, editor.selection);
            setState({ path: sel[1] });
            setSelection(sel[0]);
        }

        if (
            blocks &&
            selection &&
            (!op.get(state, 'textStyle') || editor.refresh === true)
        ) {
            const root = op.get(state, 'path', [0])[0];
            let { type } = selection;
            type = type === 'paragraph' ? 'p' : type;
            let textStyle = _.findWhere(blocks, { id: type });
            textStyle = textStyle
                ? textStyle
                : _.findWhere(blocks, { id: 'p' });

            textStyle['id'] = type;

            setState({ textStyle });
        }
    }, [blocks, editor]);

    // Set blocks
    useEffect(() => {
        setBlocks(_.where(editor.blocks, { formatter: true }));
    }, [editor.blocks]);

    // Set buttons
    useEffect(() => {
        setButtons(_.where(editor.buttons, item => op.has(item, 'formatter')));
    }, [editor.buttons]);

    // Set colors
    useEffect(() => {
        setColors(editor.colors);
    }, [editor.colors]);

    // Set fonts
    useEffect(() => {
        setFonts(editor.fonts);
        if (!op.get(state, 'font')) {
            const _fonts = _.sortBy(editor.fonts, 'label');
            const _font = _fonts[0];
            const size = 16;

            setState({
                font: _font,
                size: { label: size, value: size },
                weight: _font.weight[0],
            });
        }
    }, [editor.fonts]);

    // Set style on state changes
    useEffect(() => {
        applyStyle(state);
    }, [state]);

    // Renderers
    const render = () => {
        const {
            align,
            bgColor,
            bgOpacity,
            color,
            font,
            opacity,
            size,
            title,
            textStyle,
            weight,
        } = state;

        return (
            <EventForm ref={formRef} className={cx()} controlled>
                <Dialog header={{ title }} pref='admin.dialog.formatter'>
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
                    />
                    <ColorSelect
                        color={color || '#000000'}
                        colors={_.sortBy(colors, 'value')}
                        inherit
                        onColorChange={_onTextColorChange}
                        onColorSelect={_onTextColorSelect}
                        onOpacityChange={_onTextOpacityChange}
                        opacity={opacity}
                        title='Text color'
                    />
                    <ColorSelect
                        color={bgColor || '#FFFFFF'}
                        colors={_.sortBy(colors, 'value')}
                        onColorChange={_onBgColorChange}
                        onColorSelect={_onBgColorSelect}
                        onOpacityChange={_onBgOpacityChange}
                        opacity={bgOpacity}
                        title='Background color'
                        transparent
                    />
                    <TextAlignSelect
                        align={align}
                        buttons={buttons}
                        onClick={_onTextAlignClick}
                    />
                    <div className='p-xs-8'>
                        <Button block color='primary' size='sm' type='submit'>
                            Add New Line
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
    className: PropTypes.string,
    namespace: PropTypes.string,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'formatter',
    title: 'Text style',
};

export { Panel as default };
