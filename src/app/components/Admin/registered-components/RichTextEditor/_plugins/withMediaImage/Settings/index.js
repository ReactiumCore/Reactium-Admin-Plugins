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

const Panel = props => {
    const editor = useEditor();

    const refs = useRefs();

    const [state, update] = useDerivedState({
        borderStyleValues: [
            'solid',
            'dotted',
            'dashed',
            'double',
            'groove',
            'ridge',
            'inset',
            'outset',
            'none',
        ],
        imageProps: op.get(props, 'imageProps', { float: 'none' }),
    });

    const setState = newState =>
        new Promise(resolve => {
            update(newState);
            _.defer(() => resolve());
        });

    const {
        AlignStyles,
        BackgroundColor,
        BorderColors,
        BorderRadius,
        BorderSizes,
        BorderStyles,
        MarginStyles,
        Opacity,
        PaddingStyles,
        Settings,
        Sizing,
    } = useHookComponent('RichTextEditorSettings');

    const { Dialog } = useHookComponent('ReactiumUI');

    const cx = Reactium.Utils.cxFactory('rte-settings');

    const heading = title => ({ title });

    const pref = suffix => `admin.rte.settings.image.${suffix}`;

    const onSubmit = ({ value }) => {
        const node = Reactium.RTE.getNode(editor, props.id);
        Transforms.select(editor, node.path);
        Transforms.collapse(editor, { edge: 'end' });
        Transforms.setNodes(editor, { imageProps: value }, { at: node.path });
    };

    const onChange = e => {
        const { value } = e.target;
        let imageProps = JSON.parse(JSON.stringify(state.imageProps));
        imageProps = { ...imageProps, ...value };
        setState({ imageProps });
        onSubmit({ value });
    };

    const setValue = newValue => {
        const form = refs.get('settings');
        if (!form) return;
        form.setValue(newValue);
    };

    const setAlign = e => {
        const key = 'float';
        const value = e.currentTarget.dataset.key;
        updateStyle({ key, value });
    };

    const setBorderStyle = e => {
        const key = e.currentTarget.dataset.key;

        const val = String(
            op.get(state, ['imageProps', 'style', key], 'solid'),
        ).toLowerCase();

        let i = state.borderStyleValues.indexOf(val) + 1;
        i = i === state.borderStyleValues.length ? 0 : i;

        const value = state.borderStyleValues[i];

        updateStyle({ key, value });
    };

    const setBorderColor = ({ key, value }) => updateStyle({ key, value });

    const setBackgroundColor = e =>
        updateStyle({ key: 'backgroundColor', value: e.target.value });

    const setOpacity = e => {
        const key = 'opacity';
        const value = e.value / 100;
        updateStyle({ key, value });
    };

    const updateStyle = ({ key, value }) => {
        const imageProps = JSON.parse(JSON.stringify(state.imageProps));
        op.set(imageProps.style, key, value);

        setState({ imageProps });
        setValue({ [`style.${key}`]: value });
    };

    useFocusEffect(editor.panel.container);

    return (
        <Settings
            className={cx()}
            id='rte-image-settings'
            onSubmit={onSubmit}
            onChange={onChange}
            ref={elm => refs.set('settings', elm)}
            title={__('Image Properties')}
            footer={{}}
            value={op.get(state, 'imageProps', {})}>
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
                        styles={state.imageProps.style}
                        onChange={setOpacity}
                    />
                </div>
            </Dialog>

            <Dialog
                className='sub'
                header={heading(__('Align'))}
                pref={pref('align')}>
                <div className={cn(cx('row'), 'pb-xs-0')}>
                    <AlignStyles
                        styles={state.imageProps.style}
                        onChange={setAlign}
                        className='col-xs-12'
                    />
                </div>
            </Dialog>

            <Dialog
                className='sub'
                header={heading(__('Background Color'))}
                pref={pref('spacing.backgroundColor')}>
                <div style={{ marginTop: -1 }}>
                    <BackgroundColor
                        styles={state.imageProps.style}
                        onChange={setBackgroundColor}
                    />
                </div>
            </Dialog>

            <Dialog
                className='sub'
                header={heading(__('Margin'))}
                pref={pref('spacing.margin')}>
                <div className={cx('row')}>
                    <MarginStyles styles={state.imageProps.style} />
                </div>
            </Dialog>

            <Dialog
                className='sub'
                header={heading(__('Padding'))}
                pref={pref('spacing.padding')}>
                <div className={cx('row')}>
                    <PaddingStyles styles={state.imageProps.style} />
                </div>
            </Dialog>

            <Dialog
                className='sub'
                header={heading(__('Borders'))}
                pref={pref('borders')}>
                <div className={cx('row')}>
                    <BorderSizes styles={state.imageProps.style} />
                    <BorderRadius
                        styles={state.imageProps.style}
                        className='mt-xs-8'
                    />
                    <BorderStyles
                        styles={state.imageProps.style}
                        onChange={setBorderStyle}
                    />
                    <BorderColors
                        styles={state.imageProps.style}
                        onChange={setBorderColor}
                    />
                </div>
            </Dialog>
        </Settings>
    );
};

export default props => {
    const editor = useEditor();
    const { Button, Icon } = useHookComponent('ReactiumUI');
    const showPanel = () =>
        editor.panel
            .setID('rte-image-settings')
            .setContent(<Panel {...props} />)
            .show();

    return (
        <Button color={Button.ENUMS.COLOR.SECONDARY} onClick={showPanel}>
            <Icon name='Feather.Settings' size={12} />
        </Button>
    );
};
