import React from 'react';
import uuid from 'uuid/v4';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';

const data = [
    {
        key: 'borderTopWidth',
        input: { name: 'style.borderTopWidth', title: __('border top') },
        icon: { name: 'Linear.BorderTop', className: 'ico top' },
    },
    {
        key: 'borderRightWidth',
        input: { name: 'style.borderRightWidth', title: __('border right') },
        icon: { name: 'Linear.BorderRight', className: 'ico right' },
    },
    {
        key: 'borderBottomWidth',
        input: { name: 'style.borderBottomWidth', title: __('border bottom') },
        icon: { name: 'Linear.BorderBottom', className: 'ico bottom' },
    },
    {
        key: 'borderLeftWidth',
        input: { name: 'style.borderLeftWidth', title: __('border left') },
        icon: { name: 'Linear.BorderLeft', className: 'ico left' },
    },
];

const BorderSizes = ({ styles, ...props }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    return (
        <div {...props}>
            <div className='col-xs-12 form-group input-group qt'>
                {data.map(({ key, input: params }) => (
                    <input
                        defaultValue={op.get(styles, key, '')}
                        key={`bs-${key}`}
                        className='ico'
                        placeholder='0'
                        min={0}
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

export { BorderSizes, BorderSizes as default };
