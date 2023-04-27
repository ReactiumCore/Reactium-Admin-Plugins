import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Transforms } from 'slate';
import { useEditor } from 'slate-react';
import { Scrollbars } from '@atomic-reactor/react-custom-scrollbars';

import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

const borderStyleValues = [
    'solid',
    'dotted',
    'dashed',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset',
    'none',
];

const Panel = ({ node, path, ...props }) => {
    const editor = useEditor();

    const refs = useRefs();

    const [state, setState] = useDerivedState({
        nodeProps: op.get(node, 'nodeProps', { style: {} }),
        previous: op.get(node, 'nodeProps', { style: {} }),
    });

    const {
        BackgroundColor,
        BorderColors,
        BorderRadius,
        BorderSizes,
        BorderStyles,
        MarginStyles,
        Opacity,
        PaddingStyles,
        Position,
        Sizing,
    } = useHookComponent('RichTextEditorSettings');

    const { Dialog } = useHookComponent('ReactiumUI');

    const cx = Reactium.Utils.cxFactory('rte-settings');

    const hide = (animate = true, clear = true) =>
        editor.panel.hide(animate, clear).setID('rte-panel');

    const heading = title => ({ title });

    const _header = () => ({
        title: __('Property Inspector'),
        elements: [<CloseButton onClick={hide} key='close-btn' />],
    });

    const _footer = () => ({
        align: 'center',
        elements: [
            <SubmitButton
                onClick={submit}
                key='submit-btn'
                children={__('Submit')}
            />,
        ],
    });

    const pref = suffix => `admin.rte.settings.block.${suffix}`;

    const submit = () => onSubmit({ value: state.nodeProps });

    const onInputChange = e => setValue(e.target.name, e.target.value);

    const onSubmit = ({ value }) => {
        Reactium.Hook.runSync('rte-settings-apply', value, {
            node,
            path,
            state,
        });
        Transforms.select(editor, path);
        Transforms.collapse(editor, { edge: 'end' });
        Transforms.setNodes(editor, { nodeProps: value }, { at: path });
    };

    const mergeValue = newValue => {
        let value = JSON.parse(JSON.stringify(state.nodeProps));
        value.style = !value.style ? {} : value.style;

        Object.entries(newValue).forEach(([key, val]) => {
            if (key === 'style') return;
            op.set(value, key, val);
        });

        if (op.get(newValue, 'style')) {
            Object.entries(newValue.style).forEach(([key, val]) =>
                op.set(value.style, key, val),
            );
        }

        Reactium.Hook.runSync('rte-settings-value', value, {
            state,
            props,
        });

        return value;
    };

    const setValue = (...args) => {
        let newValue = _.isString(args[0]) ? { [args[0]]: args[1] } : args[0];

        const next = mergeValue(newValue);
        const prev = state.previous;

        const equal = _.isEqual(
            JSON.parse(JSON.stringify(next)),
            JSON.parse(JSON.stringify(prev)),
        );

        if (equal) return;

        setState({
            nodeProps: next,
            previous: JSON.parse(JSON.stringify(next)),
        });
    };

    const setBackgroundColor = e =>
        updateStyle({ key: 'backgroundColor', value: e.target.value });

    const setBorderColor = ({ key, value }) => updateStyle({ key, value });

    const setBorderStyle = ({ key, value }) => updateStyle({ key, value });

    const setOpacity = ({ value }) => updateStyle({ key: 'opacity', value });

    const setPosition = ({ key, value }) => updateStyle({ key, value });

    const updateStyle = ({ key, value }) => {
        let style = JSON.parse(
            JSON.stringify(op.get(state, 'nodeProps.style', {})),
        );

        if (Array.isArray(key) && _.isObject(value)) {
            key.forEach(k => op.set(style, k, op.get(value, k)));
        } else {
            op.set(style, key, value);
        }

        setValue({ style });
    };

    const _value = key =>
        op.get(state, _.flatten(['nodeProps', key.split('.')]), '');

    return op.get(state, 'inspector') === false ? null : (
        <div ref={elm => refs.set('container', elm)} className={cx()}>
            <Dialog
                footer={_footer()}
                header={_header()}
                collapsible={false}
                dismissable={false}
                className='ar-settings-dialog'>
                <Scrollbars>
                    <Dialog
                        className='sub'
                        pref={pref('id')}
                        header={heading(__('ID'))}>
                        <div className={cx('row')}>
                            <div className='col-xs-12 form-group'>
                                <input
                                    data-focus
                                    type='text'
                                    name='data.id'
                                    title={__('id')}
                                    onChange={onInputChange}
                                    defaultValue={_value('data.id')}
                                />
                            </div>
                        </div>
                    </Dialog>

                    {node.linkable && (
                        <Dialog
                            className='sub'
                            pref={pref('link')}
                            header={heading(__('Link'))}>
                            <div className={cx('row')}>
                                <div className='col-xs-12 form-group'>
                                    <input
                                        data-focus
                                        type='text'
                                        name='data.link'
                                        onChange={onInputChange}
                                        title={__('hyperlink to a page')}
                                        defaultValue={_value('data.link')}
                                    />
                                </div>
                            </div>
                        </Dialog>
                    )}

                    <Dialog
                        className='sub'
                        pref={pref('classname')}
                        header={heading(__('CSS Class'))}>
                        <div className={cx('row')}>
                            <div className='col-xs-12 form-group'>
                                <input
                                    type='text'
                                    name='className'
                                    title={__('css class')}
                                    onChange={onInputChange}
                                    defaultValue={_value('className')}
                                />
                            </div>
                        </div>
                    </Dialog>

                    <Dialog
                        className='sub'
                        pref={pref('align')}
                        header={heading(__('Position'))}>
                        <div className={cn(cx('row'), 'pb-xs-0')}>
                            <Position
                                className='col-xs-12'
                                onChange={setPosition}
                                onInputChange={onInputChange}
                                styles={state.nodeProps.style}
                            />
                        </div>
                    </Dialog>

                    <Dialog
                        className='sub'
                        pref={pref('sizing')}
                        header={heading(__('Size'))}>
                        <div className={cx('row')}>
                            <Sizing
                                value={state.nodeProps}
                                onChange={onInputChange}
                            />
                        </div>
                    </Dialog>

                    <Dialog
                        className='sub'
                        pref={pref('opacity')}
                        header={heading(__('Opacity'))}>
                        <div className={cx('row')}>
                            <Opacity
                                onChange={setOpacity}
                                styles={state.nodeProps.style}
                            />
                        </div>
                    </Dialog>

                    <Dialog
                        className='sub'
                        pref={pref('spacing.margin')}
                        header={heading(__('Margin'))}>
                        <div className={cx('row')}>
                            <MarginStyles
                                onChange={onInputChange}
                                styles={state.nodeProps.style}
                            />
                        </div>
                    </Dialog>

                    <Dialog
                        className='sub'
                        pref={pref('spacing.padding')}
                        header={heading(__('Padding'))}>
                        <div className={cx('row')}>
                            <PaddingStyles
                                onChange={onInputChange}
                                styles={state.nodeProps.style}
                            />
                        </div>
                    </Dialog>

                    <Dialog
                        className='sub'
                        header={heading(__('Background Color'))}
                        pref={pref('spacing.backgroundColor')}>
                        <div style={{ marginTop: -1 }}>
                            <BackgroundColor
                                styles={state.nodeProps.style}
                                onChange={setBackgroundColor}
                            />
                        </div>
                    </Dialog>

                    <Dialog
                        className='sub'
                        header={heading(__('Borders'))}
                        pref={pref('borders')}>
                        <div className={cx('row')}>
                            <BorderSizes
                                onChange={onInputChange}
                                styles={state.nodeProps.style}
                            />
                            <BorderRadius
                                className='mt-xs-8'
                                onChange={onInputChange}
                                styles={state.nodeProps.style}
                            />
                            <BorderStyles
                                styles={state.nodeProps.style}
                                onChange={setBorderStyle}
                                borderStyles={borderStyleValues}
                            />
                            <BorderColors
                                onChange={setBorderColor}
                                styles={state.nodeProps.style}
                            />
                        </div>
                    </Dialog>
                </Scrollbars>
            </Dialog>
        </div>
    );
};

const CloseButton = props => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button
            size={Button.ENUMS.SIZE.XS}
            color={Button.ENUMS.COLOR.CLEAR}
            className='ar-dialog-header-btn dismiss'
            {...props}>
            <Icon name='Feather.X' />
        </Button>
    );
};

const SubmitButton = props => {
    const { Button } = useHookComponent('ReactiumUI');
    return <Button block size={Button.ENUMS.SIZE.MD} {...props} />;
};

export default Panel;
