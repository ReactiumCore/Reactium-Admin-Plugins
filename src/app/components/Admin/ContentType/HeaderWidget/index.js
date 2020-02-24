import React from 'react';
import ENUMS from '../enums';
import useRouteParams from 'components/Admin/Content/_utils/useRouteParams';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

export default () => {
    const { path } = useRouteParams();
    const visible = String(path).startsWith('/admin/type');

    return (
        visible && (
            <Button
                appearance='pill'
                className='mr-xs-24'
                color='primary'
                size='xs'
                to='/admin/type/new'
                type='link'>
                <Icon name='Feather.Plus' className='mr-xs-12' size={18} />{' '}
                {ENUMS.TEXT.ADD}
            </Button>
        )
    );
};
