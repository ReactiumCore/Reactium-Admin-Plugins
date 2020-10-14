import React from 'react';
import op from 'object-path';
import { __, useHandle, useHookComponent, useSelect } from 'reactium-core/sdk';

export default () => {
    const Shortcodes = useHandle('Shortcodes');
    const { Button, Icon } = useHookComponent('ReactiumUI');
    const path = useSelect(state => op.get(state, 'Router.match.path'));
    const visible = String(path).startsWith('/admin/shortcodes');

    const onClick = () => Shortcodes.save();

    return !visible ? null : (
        <Button
            appearance={Button.ENUMS.APPEARANCE.PILL}
            className='mr-xs-24'
            color={Button.ENUMS.COLOR.PRIMARY}
            onClick={onClick}
            size={Button.ENUMS.SIZE.XS}
            type={Button.ENUMS.TYPE.BUTTON}>
            <Icon name='Feather.Check' size={18} />
            <span className='hide-xs show-md ml-xs-12'>
                {__('Save Shortcodes')}
            </span>
        </Button>
    );
};
