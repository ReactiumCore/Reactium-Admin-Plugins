import React from 'react';
import op from 'object-path';

import { __, useHookComponent } from 'reactium-core/sdk';

const ICONS = {
    left: { name: 'Feather.ArrowLeft' },
    none: { name: 'Feather.Slash', className: 'red' },
    right: { name: 'Feather.ArrowRight' },
};

const data = [
    {
        key: 'left',
        icon: { name: 'Feather.ArrowLeft' },
        button: { title: __('align left') },
    },
    {
        key: 'none',
        icon: { name: 'Feather.Slash', className: 'red' },
        button: { title: __('remove alignment') },
    },
    {
        key: 'right',
        icon: { name: 'Feather.ArrowRight' },
        button: { title: __('align right') },
    },
];

const AlignStyles = ({ onChange, styles, ...props }) => {
    const value = op.get(styles, 'float', 'none');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return (
        <div {...props}>
            <input type='hidden' name='style.float' defaultValue={value} />
            <div className='btn-group mt-xs--12'>
                {data.map(({ key, icon: iconProps, button: buttonProps }) => (
                    <Button
                        active={value === key}
                        style={{ height: 60 }}
                        color={Button.ENUMS.COLOR.CLEAR}
                        onClick={onChange}
                        data-key={key}
                        key={`align-${key}`}
                        {...buttonProps}>
                        <Icon {...iconProps} />
                    </Button>
                ))}
            </div>
        </div>
    );
};

export { AlignStyles, AlignStyles as default };
