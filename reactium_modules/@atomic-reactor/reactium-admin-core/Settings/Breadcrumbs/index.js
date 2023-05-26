import React, { useState, useEffect } from 'react';
import { __, useHookComponent } from '@atomic-reactor/reactium-core/sdk';
import { useDoesMatchPath } from 'reactium-admin-core';

export default () => {
    const visible = useDoesMatchPath('/admin/settings');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return !visible ? null : (
        <ul className='ar-breadcrumbs'>
            <li>
                <Button
                    className='px-0'
                    color={Button.ENUMS.COLOR.CLEAR}
                    size={Button.ENUMS.SIZE.SM}
                    type={Button.ENUMS.TYPE.BUTTON}
                >
                    <Icon name='Linear.Equalizer' className='mr-xs-12' />
                    {__('Settings')}
                </Button>
            </li>
        </ul>
    );
};
