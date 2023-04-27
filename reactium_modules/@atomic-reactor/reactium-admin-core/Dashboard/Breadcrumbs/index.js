import React from 'react';
import { __ } from 'reactium-core/sdk';
import { Button, Icon } from 'reactium-ui';

export default ({ route }) => {
    const path = route.path;
    const paths = ['', '/', '/admin'];
    const visible = paths.includes(path);

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
