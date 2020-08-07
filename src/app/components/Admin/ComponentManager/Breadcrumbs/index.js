import op from 'object-path';
import React, { useState, useEffect } from 'react';
import { __, useHookComponent, useStore } from 'reactium-core/sdk';

export default () => {
    // Store
    const store = useStore();

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const path = () =>
        String(op.get(store.getState(), 'Router.match.path', '/'));

    const [visible, setVisible] = useState(
        path().startsWith('/admin/components'),
    );

    // Watch for route updates
    useEffect(
        () =>
            store.subscribe(() => {
                setVisible(path().startsWith('/admin/components'));
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
                    <Icon name='Linear.Cube' className='mr-xs-12' />
                    {__('Components')}
                </Button>
            </li>
        </ul>
    );
};
