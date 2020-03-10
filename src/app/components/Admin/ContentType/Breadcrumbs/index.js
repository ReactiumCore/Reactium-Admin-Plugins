import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import React, { useState, useEffect } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useAsyncEffect } from 'reactium-core/sdk';
import useRouteParams from 'components/Admin/Tools/useRouteParams';

export default () => {
    const { id, path } = useRouteParams(['id']);

    const [type, setType] = useState();
    const [types, setTypes] = useState();
    const [updated, update] = useState();

    const visible = String(path).startsWith('/admin/type');
    const getTypes = refresh => Reactium.ContentType.types(refresh);

    // Get content types
    useAsyncEffect(
        async mounted => {
            const results = await getTypes(true);
            if (mounted()) setTypes(results);
            return Reactium.Cache.subscribe('content-types', async ({ op }) => {
                if (['set', 'del'].includes(op) && mounted() === true) {
                    update(Date.now());
                }
            });
        },
        [updated],
    );

    // Get content type from `id`
    useEffect(() => {
        if (!visible) return;
        const t = _.findWhere(types, { uuid: id }) || {};
        setType(op.get(t, 'meta.label'));
    }, [id, types]);

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
