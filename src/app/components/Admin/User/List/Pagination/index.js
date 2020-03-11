import _ from 'underscore';
import op from 'object-path';
import uuid from 'uuid/v4';
import Reactium from 'reactium-core/sdk';
import React, { useEffect, useState } from 'react';
import { Pagination } from '@atomic-reactor/reactium-ui';
import useRouteParams from 'components/Admin/Tools/useRouteParams';

const Wrap = ({ children, zone }) => {
    switch (zone) {
        case 'admin-user-list-bottom':
            return <div className='pagination-bottom'>{children}</div>;

        case 'admin-user-list-toolbar':
            return <span className='pagination-header'>{children}</span>;

        default:
            return <span>{children}</span>;
    }
};

const PaginationComponent = ({ list, path, zone: zones, ...props }) => {
    const zone = zones[0];
    const { state = {} } = list;
    const { page, pages } = state;

    const nav = p => list.setState({ page: p });

    const onChange = (e, p) => nav(p);

    const render = () => {
        if (!page || !pages) return null;

        let color, size, verticalAlign;

        switch (zone) {
            case 'admin-user-list-bottom':
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

export default props => {
    const list = op.get(props, 'list');
    const { path } = useRouteParams(['path']);
    const isVisible = () =>
        Boolean(String(path).startsWith('/admin/users/') && list);
    return isVisible() ? <PaginationComponent {...props} path={path} /> : null;
};
