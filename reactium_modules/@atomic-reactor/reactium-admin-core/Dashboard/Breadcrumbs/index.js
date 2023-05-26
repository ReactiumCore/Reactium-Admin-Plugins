import React from 'react';
import { __ } from '@atomic-reactor/reactium-core/sdk';
import { Button, Icon } from 'reactium-ui';
import { useDoesMatchPath } from 'reactium-admin-core';

export default () => {
    const visible = useDoesMatchPath((path) =>
        ['', '/', '/admin'].includes(path),
    );

    return (
        visible && (
            <ul className='ar-breadcrumbs'>
                <li>
                    <Button className='px-0' color='clear' readOnly size='sm'>
                        <Icon name='Linear.Window' className='mr-xs-12' />
                        {__('Dashboard')}
                    </Button>
                </li>
            </ul>
        )
    );
};
