import React, { useEffect } from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

const noop = () => {};

const KEYS = [
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
];

const ColorButton = ({ active, onClick, prop, styles }) => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    const value = op.get(styles, prop);
    const style = { backgroundColor: value };
    return (
        <Button
            active={active === prop}
            color={Button.ENUMS.COLOR.CLEAR}
            data-key={prop}
            onClick={onClick}
            title={__('border color')}>
            <input type='hidden' name={`style.${prop}`} defaultValue={value} />
            <div style={style} />
            <small>
                <Icon name='Linear.Palette' size={16} />
            </small>
        </Button>
    );
};

const BorderColors = ({ className, onChange, styles, ...props }) => {
    const refs = useRefs();

    const { Collapsible } = useHookComponent('ReactiumUI');

    const { ColorSelect } = useHookComponent('RichTextEditorSettings');

    const [state, update] = useDerivedState({
        active: null,
        expanded: false,
        value: styles,
    });

    const setState = newState =>
        new Promise(resolve => {
            update(newState);
            _.defer(() => resolve({ ...state, ...newState }));
        });

    const extendColors = () => {
        const newColors = colors => {
            colors.splice(0, 0, {
                className: 'transparent light',
                label: __('transparent'),
                value: 'transparent',
            });

            colors.splice(0, 0, {
                className: 'remove',
                label: __('none'),
                value: null,
            });
        };

        const hook = String('rte-colors').toLowerCase();
        const HID = Reactium.Hook.registerSync(hook, newColors);

        return () => {
            Reactium.Hook.unregister(HID);
        };
    };

    const onCollapse = () => {
        setState({ expanded: false });
    };

    const scrollTo = () => {
        const collapsible = refs.get('collapsible');
        if (!collapsible) return;
        collapsible.container.scrollIntoView();
    };

    const onExpand = () => {
        setState({ expanded: true });
    };

    const toggle = e => {
        const collapsible = refs.get('collapsible');
        if (!collapsible) return;

        const active = e.target.dataset.key;

        if (state.active === active) {
            if (state.expanded) {
                setState({ active: null });
            }
            collapsible.toggle().then(scrollTo);
        } else {
            collapsible.expand().then(scrollTo);
            setState({ active });
        }
    };

    const onClick = e => {
        const key = state.active;
        const val = e.target.value;

        const { value } = state;
        op.set(value, key, val);

        setState({ value }).then(() =>
            onChange({ key: Object.keys(value), value }),
        );
    };

    useEffect(extendColors, []);

    return (
        <>
            <div {...props} className={cn('borderColors', className)}>
                <div className='btn-group'>
                    {KEYS.map(prop => (
                        <ColorButton
                            prop={prop}
                            active={state.active}
                            onClick={toggle}
                            styles={styles}
                            key={uuid()}
                        />
                    ))}
                </div>
            </div>
            <div className='borderColorSelect'>
                <Collapsible
                    expanded={state.expanded}
                    onCollapse={onCollapse}
                    onExpand={onExpand}
                    ref={elm => refs.set('collapsible', elm)}>
                    <ColorSelect
                        name={`style.${state.active}`}
                        onChange={onClick}
                        value={
                            state.active
                                ? op.get(state.value, state.active)
                                : null
                        }
                    />
                </Collapsible>
            </div>
        </>
    );
};

BorderColors.defaultProps = {
    onChange: noop,
    styles: {},
};

export { BorderColors, BorderColors as default };
