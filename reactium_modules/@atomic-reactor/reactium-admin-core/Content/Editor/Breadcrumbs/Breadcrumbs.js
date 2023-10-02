import _ from 'underscore';
import op from 'object-path';
import React, { useCallback, useMemo } from 'react';
import { useContentTypes } from '../../TypeList/useContentTypes';
import { useDoesMatchPath, useRouteParams } from 'reactium-admin-core';

import Reactium, {
    __,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Component: Breadcrumbs
 * -----------------------------------------------------------------------------
 */

const Render = () => {
    const params = useRouteParams();

    const [types] = useContentTypes(null);

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const type = useMemo(
        () =>
            types === null
                ? null
                : _.findWhere(types, { machineName: op.get(params, 'type') }),
        [types],
    );

    const slug = useMemo(
        () => (!types || !type || !op.get(params, 'slug') ? null : params.slug),
        [type, types, op.get(params, 'slug')],
    );

    const onClick = useCallback(
        () =>
            !slug
                ? null
                : Reactium.Routing.history.push(
                      `/admin/content/${params.type}/page/1`,
                  ),
        [slug],
    );

    return !type ? null : (
        <ul className='ar-breadcrumbs'>
            <li>
                <Button className='px-0' color='clear' readOnly size='sm'>
                    <Icon name={type.meta.icon} className='mr-xs-12' />
                    {__('Content')}
                </Button>
            </li>
            {type && (
                <li className='uppercase'>
                    <a href='javascript:void(0)' onClick={onClick}>
                        {type.machineName}
                    </a>
                </li>
            )}
            {slug && (
                <li className='hide-xs show-md'>
                    {slug === 'new' ? __('NEW') : slug}
                </li>
            )}
        </ul>
    );
};

export const Breadcrumbs = (props) => {
    const visible = useDoesMatchPath((path) =>
        path.startsWith('/admin/content'),
    );

    return !visible ? null : <Render {...props} />;
};
