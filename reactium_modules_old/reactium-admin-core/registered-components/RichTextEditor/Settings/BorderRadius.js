import React from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';

const data = [
    {
        key: 'borderTopLeftRadius',
        input: {
            name: 'style.borderTopLeftRadius',
            title: __('border radius top-left'),
        },
        icon: { name: 'Feather.ArrowUpLeft', className: 'ico top' },
    },
    {
        key: 'borderTopRightRadius',
        input: {
            name: 'style.borderTopRightRadius',
            title: __('border radius top-right'),
        },
        icon: { name: 'Feather.ArrowUpRight', className: 'ico right' },
    },
    {
        key: 'borderBottomRightRadius',
        input: {
            name: 'style.borderBottomRightRadius',
            title: __('border radius bottom-right'),
        },
        icon: { name: 'Feather.ArrowDownRight', className: 'ico bottom' },
    },
    {
        key: 'borderBottomLeftRadius',
        input: {
            name: 'style.borderBottomLeftRadius',
            title: __('border radius bottom-left'),
        },
        icon: { name: 'Feather.ArrowDownLeft', className: 'ico left' },
    },
];

const noop = () => {};

const BorderRadius = ({ onChange = noop, styles, ...props }) => {
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

export { BorderRadius, BorderRadius as default };
