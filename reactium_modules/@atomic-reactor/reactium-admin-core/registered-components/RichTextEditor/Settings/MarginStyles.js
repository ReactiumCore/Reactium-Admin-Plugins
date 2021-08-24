import React from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';

const data = [
    {
        key: 'marginTop',
        input: { name: 'style.marginTop', title: __('margin top') },
        icon: { name: 'Feather.ArrowUp', className: 'ico top' },
    },
    {
        key: 'marginRight',
        input: { name: 'style.marginRight', title: __('margin right') },
        icon: { name: 'Feather.ArrowRight', className: 'ico right' },
    },
    {
        key: 'marginBottom',
        input: { name: 'style.marginBottom', title: __('margin bottom') },
        icon: { name: 'Feather.ArrowDown', className: 'ico bottom' },
    },
    {
        key: 'marginLeft',
        input: { name: 'style.marginLeft', title: __('margin left') },
        icon: { name: 'Feather.ArrowLeft', className: 'ico left' },
    },
];

const noop = () => {};

const MarginStyles = ({ onChange = noop, styles, ...props }) => {
    const { Icon } = useHookComponent('ReactiumUI');

    const _onChange = e => {
        let value = e.target.value;
        value = _.compact([value]).length < 1 ? null : value;
        value = value && _.isNumber(Number(value)) ? `${value}px` : value;
        value = _.isNull(value) ? '' : value;
        onChange({ target: { name: e.target.name, value } });
    };

    return (
        <div {...props}>
            <div className='col-xs-12 form-group input-group qt'>
                {data.map(({ key, input: params }) => (
                    <input
                        defaultValue={op.get(styles, key, '')}
                        onChange={_onChange}
                        key={`ms-${key}`}
                        className='ico'
                        placeholder='0'
                        {...params}
                    />
                ))}
            </div>
            <div className='icons'>
                {data.map(({ icon: params }) => (
                    <Icon {...params} key={uuid()} />
                ))}
            </div>
        </div>
    );
};

export { MarginStyles, MarginStyles as default };
