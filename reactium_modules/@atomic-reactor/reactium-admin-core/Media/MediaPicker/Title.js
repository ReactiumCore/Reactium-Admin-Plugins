import React from 'react';

export default ({ picker }) => {
    const { cx, state } = picker;
    return <h4 className={cx('title')}>{state.title}</h4>;
};
