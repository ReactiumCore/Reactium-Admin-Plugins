import React from 'react';

const BranchesScene = props => {
    const { handle } = props;
    const { cx } = handle;
    return (
        <div className={cx('branches')}>
            <pre>{JSON.stringify(handle.state, null, 2)}</pre>
        </div>
    );
};

export default BranchesScene;
