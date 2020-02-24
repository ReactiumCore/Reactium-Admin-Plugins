import React from 'react';
import ENUMS from 'components/Admin/Content/enums';
import useRouteParams from '../_utils/useRouteParams';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

export default () => {
    const { group, machineName, path, slug, type } = useRouteParams();
    const visible = String(path).startsWith('/admin/content');

    return (
        visible && (
            <ul className='ar-breadcrumbs'>
                <li>
                    <Button
                        appearance='pill'
                        className='px-0'
                        color='clear'
                        size='sm'
                        to={`/admin/content/${group}`}
                        type='link'>
                        <Icon name='Linear.Document2' className='mr-xs-12' />
                        {group}
                    </Button>
                </li>
                {slug && <li className='uppercase'>{slug}</li>}
            </ul>
        )
    );
};
