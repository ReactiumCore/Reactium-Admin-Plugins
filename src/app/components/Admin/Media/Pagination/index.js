import React, { useRef } from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Pagination as PaginationUI } from '@atomic-reactor/reactium-ui';

const Pagination = ({ Media }) => {
    const { cname, state } = Media;
    const { pagination } = state;

    const page = op.get(state, 'pagination.page', 1);
    const pages = op.get(state, 'pagination.pages', 1);

    const _onSelect = e => {
        if (!op.get(e, 'item')) return;
        Media.setPage(e.item.value);
    };

    const _onNext = e => {
        const next = op.get(pagination, 'next');
        Media.setPage(next);
    };

    const _onPrev = e => {
        const prev = op.get(pagination, 'prev');
        Media.setPage(prev);
    };

    return pagination && pages > 1 ? (
        <div className={cname('pagination')}>
            <PaginationUI
                color={PaginationUI.COLOR.CLEAR}
                dropdown
                onClick={_onSelect}
                onNextClick={_onNext}
                onPrevClick={_onPrev}
                page={page}
                pages={pages}
                size='md'
                verticalAlign='top'
            />
        </div>
    ) : null;
};

export { Pagination, Pagination as default };
