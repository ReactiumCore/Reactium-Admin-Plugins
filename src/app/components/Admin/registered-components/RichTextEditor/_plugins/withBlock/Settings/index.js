import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Transforms } from 'slate';
import { useEditor } from 'slate-react';

import Reactium, {
    __,
    useDerivedState,
    useFocusEffect,
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

const Panel = props => {
    const editor = useEditor();

    const refs = useRefs();

    const [state] = useDerivedState({
        nodeProps: op.get(props, 'nodeProps', { style: { opacity: 1 } }),
        previous: op.get(props, 'nodeProps', { style: { opacity: 1 } }),
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
        Settings,
        Sizing,
    } = useHookComponent('RichTextEditorSettings');

    const { Dialog } = useHookComponent('ReactiumUI');

    const cx = Reactium.Utils.cxFactory('rte-settings');

    const heading = title => ({ title });

    const pref = suffix => `admin.rte.settings.image.${suffix}`;

    const onSubmit = ({ value }) => {
        const { node, path } = Reactium.RTE.getNode(editor, props.id);

        Reactium.Hook.runSync('rte-settings-apply', value, {
            node,
            path,
            state,
        });
        Transforms.select(editor, path);
        Transforms.collapse(editor, { edge: 'end' });
        Transforms.setNodes(editor, { nodeProps: value }, { at: path });
    };

    //const onSubmit = _.throttle(_onSubmit, 1000, { trailing: false });

    const _onChange = ({ value }) => setValue(value);
    const onChange = _.debounce(_onChange, 500);

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

    const setValue = newValue => {
        const next = mergeValue(newValue);
        const prev = state.previous;

        const equal = _.isEqual(
            JSON.parse(JSON.stringify(next)),
            JSON.parse(JSON.stringify(prev)),
        );

        if (equal) return;

        state.nodeProps = next;

        onSubmit({ value: next });

        state.previous = JSON.parse(JSON.stringify(next));
    };

    const setBackgroundColor = e =>
        updateStyle({ key: 'backgroundColor', value: e.target.value });

    const setBorderColor = ({ key, value }) => updateStyle({ key, value });

    const setBorderStyle = ({ key, value }) => updateStyle({ key, value });

    const setOpacity = ({ value }) => updateStyle({ key: 'opacity', value });

    const setPosition = ({ key, value }) => updateStyle({ key, value });

    const updateStyle = ({ key, value }) => {
        const style = JSON.parse(
            JSON.stringify(op.get(state, 'nodeProps.style', {})),
        );

        if (Array.isArray(key) && _.isObject(value)) {
            key.forEach(k => op.set(style, k, op.get(value, k)));
        } else {
            op.set(style, key, value);
        }

        setValue({ style });
    };

    useFocusEffect(editor.panel.container);

    return (
        <Settings
            className={cx()}
            footer={{}}
            id='rte-image-settings'
            onChange={onChange}
            ref={elm => refs.set('settings', elm)}
            title={props.title}
            value={op.get(state, 'nodeProps', {})}>
            <Dialog
                className='sub'
                header={heading(__('CSS Class'))}
                pref={pref('classname')}>
                <div className={cx('row')}>
                    <div className='col-xs-12 form-group'>
                        <input
                            data-focus
                            type='text'
                            name='className'
                            title={__('css class')}
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog
                className='sub'
                header={heading(__('Position'))}
                pref={pref('align')}>
                <div className={cn(cx('row'), 'pb-xs-0')}>
                    <Position
                        styles={state.nodeProps.style}
                        onChange={setPosition}
                        className='col-xs-12'
                    />
                </div>
            </Dialog>

            <Dialog
                className='sub'
                header={heading(__('Size'))}
                pref={pref('sizing')}>
                <div className={cx('row')}>
                    <Sizing />
                </div>
            </Dialog>

            <Dialog
                className='sub'
                header={heading(__('Opacity'))}
                pref={pref('opacity')}>
                <div className={cx('row')}>
                    <Opacity
                        styles={state.nodeProps.style}
                        onChange={setOpacity}
                    />
                </div>
            </Dialog>

            <Dialog
                className='sub'
                header={heading(__('Margin'))}
                pref={pref('spacing.margin')}>
                <div className={cx('row')}>
                    <MarginStyles styles={state.nodeProps.style} />
                </div>
            </Dialog>

            <Dialog
                className='sub'
                header={heading(__('Padding'))}
                pref={pref('spacing.padding')}>
                <div className={cx('row')}>
                    <PaddingStyles styles={state.nodeProps.style} />
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
                    <BorderSizes styles={state.nodeProps.style} />
                    <BorderRadius
                        styles={state.nodeProps.style}
                        className='mt-xs-8'
                    />
                    <BorderStyles
                        styles={state.nodeProps.style}
                        onChange={setBorderStyle}
                        borderStyles={borderStyleValues}
                    />
                    <BorderColors
                        styles={state.nodeProps.style}
                        onChange={setBorderColor}
                    />
                </div>
            </Dialog>
        </Settings>
    );
};

Panel.defaultProps = {
    title: __('Property Inspector'),
};

export default props => {
    const editor = useEditor();
    const { Button, Icon } = useHookComponent('ReactiumUI');
    const showPanel = () =>
        editor.panel
            .setID('rte-settings')
            .setContent(<Panel {...props} />)
            .show();

    return (
        <Button color={Button.ENUMS.COLOR.SECONDARY} onClick={showPanel}>
            <Icon
                name={props.icon || 'Linear.PageBreak'}
                size={props.iconSize || 12}
            />
        </Button>
    );
};
