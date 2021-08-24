import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';

export default ({ picker }) => {
    const { cx, setState, state } = picker;
    const { page, pages } = state;

    const { Pagination } = useHookComponent('ReactiumUI');

    const onChange = (e, p) => setState({ page: p });

    return pages > 1 ? (
        <div className={cx('pagination')}>
            <Pagination
                page={page}
                pages={pages}
                numbers={3}
                onChange={onChange}
            />
        </div>
    ) : null;
};
