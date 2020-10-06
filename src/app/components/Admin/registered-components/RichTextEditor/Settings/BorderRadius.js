import React from 'react';
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

const BorderRadius = ({ styles, ...props }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    return (
        <div {...props}>
            <div className='col-xs-12 form-group input-group qt'>
                {data.map(({ key, input: params }) => (
                    <input
                        defaultValue={op.get(styles, key, '')}
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
