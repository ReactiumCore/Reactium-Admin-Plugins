import React from 'react';
import uuid from 'uuid/v4';
import op from 'object-path';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

const Wrap = ({ children, zone }) => {
    switch (zone) {
        case 'admin-content-list-bottom':
            return <div className='pagination-bottom'>{children}</div>;

        case 'admin-content-list-toolbar':
            return <span className='pagination-header'>{children}</span>;

        default:
            return <span>{children}</span>;
    }
};

export default ({ list, zone: zones }) => {
    const { Pagination } = useHookComponent('ReactiumUI');

    const zone = zones[0];

    const { state = {} } = list;

    const { group } = state;

    const page = op.get(state, 'pagination.page', 1);
    const pages = op.get(state, 'pagination.pages', 1);

    const nav = p =>
        Reactium.Routing.history.push(`/admin/content/${group}/page/${p}`);

    const onChange = (e, p) => nav(p);

    const render = () => {
        if (!page || !pages || pages === 1) return null;

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
