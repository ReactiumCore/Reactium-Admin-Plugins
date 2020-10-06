import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useState } from 'react';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

const noop = () => {};

const Opacity = ({ className, onChange, styles, ...props }) => {
    const { Slider } = useHookComponent('ReactiumUI');

    const [value, setValue] = useState(op.get(styles, 'opacity', 100));

    const label = value => (value ? `${value}%` : '');

    const _onChange = e => {
        const newValue = e.value / 100;
        setValue(newValue);
        onChange({ value: newValue });
    };

    const __onChange = _.throttle(_onChange, 1000, { leading: false });

    useEffect(() => {
        const HID = Reactium.Hook.registerSync('rte-settings-value', value => {
            const opacity = op.get(value, 'style.opacity', 1);
            if (opacity > 1) {
                op.set(value, 'style.opacity', opacity / 100);
            }
        });

        return () => Reactium.Hook.unregister(HID);
    }, []);

    return (
        <div className={cn('col-xs-12', 'px-xs-24', className)} {...props}>
            <Slider
                min={0}
                max={100}
                value={value}
                labelFormat={label}
                name='style.opacity'
                onChange={__onChange}
            />
        </div>
    );
};

Opacity.defaultProps = {
    onChange: noop,
    styles: {},
};

export { Opacity, Opacity as default };
