import _ from 'underscore';
import op from 'object-path';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useAsyncEffect } from 'reactium-core/sdk';
import useRouteParams from 'reactium_modules/@atomic-reactor/reactium-admin-core/Tools/useRouteParams';

export default () => {
    const { group, page, path, slug, type } = useRouteParams([
        'type',
        'slug',
        'page',
        'group',
    ]);

    const isVisible = () => String(path).startsWith('/admin/content/:type');

    const [icon, setIcon] = useState();
    const [types, setTypes] = useState([]);

    const isSlug = () => String(path).includes('/:slug');

    const isNew = () => Boolean(isSlug() && slug === 'new');

    const getTypes = () => Reactium.ContentType.types();

    useAsyncEffect(
        async mounted => {
            if (!isVisible()) return;
            const results = await getTypes();
            if (mounted()) setTypes(results);
        },
        [path],
    );

    useEffect(() => {
        if (!isVisible() || !type) return;
        const t = _.findWhere(types, { type }) || {};
        const i = op.get(t, 'meta.icon');
        if (i === icon) return;
        setIcon(i);
    }, [type, types, isVisible()]);

    return isVisible() && icon ? (
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
