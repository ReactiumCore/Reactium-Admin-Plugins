import React from 'react';
import ENUMS from 'components/Admin/Content/enums';
import useRouteParams from '../_utils/useRouteParams';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

export default () => {
    const { group, machineName, path, slug, type } = useRouteParams();
    const visible = String(path).startsWith('/admin/content');

    return (
        visible && (
            <Button
                appearance='pill'
                className='mr-xs-24'
                color='primary'
                outline
                size='xs'
                to={`/admin/content/${type}/new`}
                type='link'>
                <Icon name='Feather.Plus' size={18} />
                <span className='hide-xs show-md ml-xs-12'>
                    {' '}
                    {ENUMS.TEXT.NEW} {type}
                </span>
            </Button>
        )
    );
};
