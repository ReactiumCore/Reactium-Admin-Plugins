import _ from 'underscore';
import op from 'object-path';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import ENUMS from 'components/Admin/Content/enums';
import useRouteParams from 'components/Admin/Tools/useRouteParams';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useAsyncEffect } from 'reactium-core/sdk';

export default () => {
    const { group, page, path, slug, type } = useRouteParams([
        'type',
        'slug',
        'page',
        'group',
    ]);
    const visible = String(path).startsWith('/admin/content/:type');

    const [icon, setIcon] = useState();
    const [types, setTypes] = useState([]);
    const [updated, update] = useState();

    const isSlug = () => {
        return String(path).includes('/:slug');
    };

    const isNew = () => {
        return isSlug() && slug === 'new';
    };

    const getTypes = refresh => Reactium.ContentType.types({ refresh });

    useAsyncEffect(
        async mounted => {
            if (!visible) return;
            const results = await getTypes();
            if (mounted()) setTypes(results);
            return Reactium.Cache.subscribe('content-types', async ({ op }) => {
                if (['set', 'del'].includes(op) && mounted() === true) {
                    update(Date.now());
                }
            });
        },
        [updated, visible],
    );

    useEffect(() => {
        if (!visible || !type) return;
        const t = _.findWhere(types, { type }) || {};
        const i = op.get(t, 'meta.icon');
        if (i === icon) return;
        setIcon(i);
    }, [type, types, visible]);

    return visible && icon ? (
        <ul className='ar-breadcrumbs'>
            <li>
                <Button
                    appearance='pill'
                    className='px-0'
                    color='clear'
                    size='sm'
                    to={`/admin/content/${group}/page/1`}
                    type='link'>
                    <Icon name={icon} className='mr-xs-12' />
                    {group}
                </Button>
            </li>
            {isSlug() && <li className='uppercase'>{slug}</li>}
            {!isNew() && !page && (
                <li className='hide-xs-only'>
                    <Link to={`/admin/content/${type}/new`}>
                        <Icon name='Feather.Plus' size={14} />
                    </Link>
                </li>
            )}
        </ul>
    ) : null;
};
