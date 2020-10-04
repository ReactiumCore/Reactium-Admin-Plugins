import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { useHookComponent } from 'reactium-core/sdk';

const noop = () => {};

const Opacity = ({ className, onChange, styles, ...props }) => {
    const { Slider } = useHookComponent('ReactiumUI');

    const getValue = () => {
        let val = op.get(styles, 'opacity', 1);
        return val * 100;
    };

    const label = value => `${value}%`;

    const _onChange = _.debounce(onChange, 250);
    return (
        <div className={cn('col-xs-12', 'px-xs-24', className)} {...props}>
            <Slider
                min={0}
                max={100}
                value={getValue()}
                labelFormat={label}
                onChange={_onChange}
                name='style.opacity'
            />
        </div>
    );
};

Opacity.defaultProps = {
    onChange: noop,
    styles: {},
};

export { Opacity, Opacity as default };
