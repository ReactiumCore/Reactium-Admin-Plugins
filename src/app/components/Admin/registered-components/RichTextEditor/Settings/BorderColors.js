import React, { useEffect } from 'react';
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
                <Icon name='Linear.Drop2' size={12} />
            </small>
        </Button>
    );
};

const BorderColors = ({ className, onChange, styles, ...props }) => {
    const refs = useRefs();

    const { Collapsible } = useHookComponent('ReactiumUI');

    const { ColorSelect } = useHookComponent('RichTextEditorSettings');

    const [state, setState] = useDerivedState({
        active: null,
        expanded: false,
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
            collapsible.toggle();
        } else {
            collapsible.expand();
            setState({ active });
        }
    };

    const _onChange = e => {
        const key = state.active;
        const value = e.target.value;
        onChange({ key, value });
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
                        onChange={_onChange}
                        value={
                            state.active ? op.get(styles, state.active) : null
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
