import React from 'react';
import uuid from 'uuid/v4';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';

const data = [
    {
        key: 'paddingTop',
        input: { name: 'style.paddingTop', title: __('border top') },
        icon: { name: 'Feather.ArrowUp', className: 'ico top' },
    },
    {
        key: 'paddingRight',
        input: { name: 'style.paddingRight', title: __('border right') },
        icon: { name: 'Feather.ArrowRight', className: 'ico right' },
    },
    {
        key: 'paddingBottom',
        input: { name: 'style.paddingBottom', title: __('border bottom') },
        icon: { name: 'Feather.ArrowDown', className: 'ico bottom' },
    },
    {
        key: 'paddingLeft',
        input: { name: 'style.paddingLeft', title: __('border left') },
        icon: { name: 'Feather.ArrowLeft', className: 'ico left' },
    },
];

const PaddingStyles = ({ styles, ...props }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    return (
        <div {...props}>
            <div className='col-xs-12 form-group input-group qt'>
                {data.map(({ key, input: params }) => (
                    <input
                        defaultValue={op.get(styles, key, '')}
                        key={`ps-${key}`}
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

export { PaddingStyles, PaddingStyles as default };
