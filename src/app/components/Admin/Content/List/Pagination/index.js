import _ from 'underscore';
import op from 'object-path';
import uuid from 'uuid/v4';
import React, { useEffect, useState } from 'react';
import { Dropdown, Pagination } from '@atomic-reactor/reactium-ui';

import useRouteParams from '../../_utils/useRouteParams';

import Reactium, {
    useDerivedState,
    useFulfilledObject,
    useHandle,
} from 'reactium-core/sdk';

const Wrap = ({ children, zone, ...props }) => {
    switch (zone) {
        case 'admin-content-list-bottom':
            return (
                <div {...props} className='pagination-bottom'>
                    {children}
                </div>
            );

        case 'admin-logo':
            return (
                <span {...props} className='pagination-header'>
                    {children}
                </span>
            );

        default:
            return <span {...props}>{children}</span>;
    }
};

const PaginationComponent = ({ list, zone, ...props }) => {
    const { state = {} } = list;

    const { group, pagination = {}, path } = state;

    const { page, pages } = pagination;

    const nav = p => {
        Reactium.Routing.history.push(`/admin/content/${group}/page/${p}`);
    };

    const onChange = (e, p) => nav(p);

    const render = () => {
        //console.log({ page, pages, pagination });

        if (!page || !pages) return null;

        let color, size, verticalAlign;

        switch (zone) {
            case 'admin-content-list-bottom':
                color = Pagination.COLOR.CLEAR;
                verticalAlign = 'top';
                size = 'md';
                break;

            default:
                color = Pagination.COLOR.CLEAR;
                verticalAlign = 'bottom';
                size = 'sm';
                break;
        }

        return (
            <Wrap zone={zone}>
                <Pagination
                    dropdown
                    color={color}
                    onChange={onChange}
                    page={Number(page)}
                    pages={Number(pages)}
                    size={size}
                    id={uuid()}
                    verticalAlign={verticalAlign}
                />
            </Wrap>
        );
    };

    return render();
};

export default ({ list, props }) => {
    const { page, group, path, type } = useRouteParams([
        'page',
        'path',
        'group',
        'type',
    ]);

    const isVisible = () => {
        if (!list) return false;
        if (!page || !path || !group) return false;
        if (String(path).startsWith('/admin/content/:type/:slug')) return false;
        return String(path).startsWith('/admin/content/:type');
    };

    return isVisible() ? <PaginationComponent list={list} {...props} /> : null;
};
