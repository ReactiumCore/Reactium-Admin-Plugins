import op from 'object-path';
import React, { useState, useEffect } from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';
import { useStore } from '@atomic-reactor/use-select';

export default () => {
    // Store
    const store = useStore();

    const path = () =>
        String(op.get(store.getState(), 'Router.match.path', '/'));

    const [visible, setVisible] = useState(path().startsWith('/admin/plugins'));

    const { Button, Icon } = useHookComponent('ReactiumUI');

    // Watch for route updates
    useEffect(
        () =>
            store.subscribe(() => {
                setVisible(path().startsWith('/admin/plugins'));
            }),
        [],
    );

    return !visible ? null : (
        <ul className='ar-breadcrumbs'>
            <li>
                <Button
                    className='px-0'
                    color={Button.ENUMS.COLOR.CLEAR}
                    size={Button.ENUMS.SIZE.SM}
                    type={Button.ENUMS.TYPE.BUTTON}>
                    <Icon name='Linear.Cord' className='mr-xs-12' />
                    {__('Plugins')}
                </Button>
            </li>
        </ul>
    );
};
