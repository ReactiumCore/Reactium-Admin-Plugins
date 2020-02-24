import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import React, { useState, useEffect } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useAsyncEffect } from 'reactium-core/sdk';
import useRouteParams from 'components/Admin/Content/_utils/useRouteParams';

export default () => {
    const { id, path } = useRouteParams(['id']);

    const watch = ['set', 'del'];
    const [type, setType] = useState();
    const [types, setTypes] = useState();
    const [updated, update] = useState();

    const visible = String(path).startsWith('/admin/type');
    const getTypes = refresh => Reactium.ContentType.types(refresh);

    // Get content types
    useAsyncEffect(async () => {
        const results = await getTypes();
        setTypes(results);
        return () => {};
    });

    // Get content type from `id`
    useEffect(() => {
        if (!visible) return;
        const t = _.findWhere(types, { uuid: id }) || {};
        setType(op.get(t, 'meta.label'));
    }, [id, types]);

    // Watch for changes
    useEffect(() => {
        if (!visible) return;
        return Reactium.Cache.subscribe('content-types', async ({ op }) => {
            if (watch.includes(op)) {
                const results = await getTypes(true);
                setTypes(results);
                update(uuid());
            }
        });
    }, [id, path]);

    return (
        visible && (
            <ul className='ar-breadcrumbs'>
                <li>
                    <Button
                        className='px-0'
                        color='clear'
                        size='sm'
                        to='/admin/types'
                        type='link'>
                        <Icon name='Linear.Typewriter' className='mr-xs-12' />
                        {__('Content Types')}
                    </Button>
                </li>
                {id && <li className='uppercase'>{type || __('New')}</li>}
                {id && type && (
                    <li className='hide-xs show-md'>
                        {id === 'new' ? 'NEW' : id}
                    </li>
                )}
            </ul>
        )
    );
};
