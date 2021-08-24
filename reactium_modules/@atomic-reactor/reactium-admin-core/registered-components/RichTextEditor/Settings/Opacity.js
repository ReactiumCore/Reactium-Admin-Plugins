import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { useDerivedState, useHookComponent } from 'reactium-core/sdk';

const noop = () => {};

const Opacity = ({ className, onChange, styles, ...props }) => {
    const { Slider } = useHookComponent('ReactiumUI');

    const [state, setState] = useDerivedState({
        value: op.get(styles, 'opacity', 100),
    });

    const label = value => (value ? `${value}%` : '');

    const isFloat = n => Boolean(Number(n) === n && n % 1 !== 0) || n === 1;

    const _onChange = e => {
        const value = isFloat(e.value) ? e.value : e.value / 100;

        setState({ value });
        onChange({ value });
    };

    const __onChange = _.throttle(_onChange, 1000, { leading: false });

    return (
        <div className={cn('col-xs-12', 'px-xs-24', className)} {...props}>
            <Slider
                min={0}
                max={100}
                labelFormat={label}
                onChange={__onChange}
                value={isFloat(state.value) ? state.value * 100 : state.value}
            />
        </div>
    );
};

Opacity.defaultProps = {
    onChange: noop,
    styles: {},
};

export { Opacity, Opacity as default };
