import op from 'object-path';
import React, { useState, useEffect } from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';
// import { useStore } from '@atomic-reactor/use-select';

export default () => {
    // Store
    // TODO: Fix me
    // const store = useStore();

    const isPath = () => false;
    // op.get(store.getState(), 'Router.match.path') === '/admin/settings';

    const [visible, setVisible] = useState(isPath());

    const { Button, Icon } = useHookComponent('ReactiumUI');

    // Watch for route updates
    // useEffect(
    //     () =>
    //         store.subscribe(() => {
    //             setVisible(isPath());
    //         }),
    //     [],
    // );

    return !visible ? null : (
        <ul className='ar-breadcrumbs'>
            <li>
                <Button
                    className='px-0'
                    color={Button.ENUMS.COLOR.CLEAR}
                    size={Button.ENUMS.SIZE.SM}
                    type={Button.ENUMS.TYPE.BUTTON}>
                    <Icon name='Linear.Equalizer' className='mr-xs-12' />
                    {__('Settings')}
                </Button>
            </li>
        </ul>
    );
};
