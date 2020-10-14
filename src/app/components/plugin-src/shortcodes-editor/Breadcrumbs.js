import React from 'react';
import op from 'object-path';
import { __, useHookComponent, useSelect } from 'reactium-core/sdk';

export default () => {
    const path = useSelect(state => op.get(state, 'Router.match.path'));
    const visible = String(path).startsWith('/admin/shortcodes');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return !visible ? null : (
        <ul className='ar-breadcrumbs'>
            <li>
                <Button
                    className='px-0'
                    color={Button.ENUMS.COLOR.CLEAR}
                    size={Button.ENUMS.SIZE.SM}
                    type={Button.ENUMS.TYPE.BUTTON}>
                    <Icon name='Linear.Puzzle' className='mr-xs-12' />
                    {__('Shortcodes')}
                </Button>
            </li>
        </ul>
    );
};
