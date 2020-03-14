import React from 'react';

const RevisionsScene = props => {
    const { handle } = props;
    const { cx } = handle;
    return <div className={cx('revisions')}>Revisions</div>;
};

export default RevisionsScene;
