import React from 'react';
import op from 'object-path';
import cn from 'classnames';
import { Scrollbars } from 'react-custom-scrollbars';
import SelectBranch from '../../_helpers/SelectBranch';
import SelectCompare from '../../_helpers/SelectCompare';

const BranchesScene = props => {
    const { handle } = props;
    const { cx, state } = handle;
    const from = op.get(state, 'working.content', {});
    const to = op.get(state, 'compare.content', {});

    const renderRows = () => {
        return <pre>{JSON.stringify(state.types, null, 2)}</pre>;
    };

    return (
        <div className={cx('branches')}>
            <div className={cx('branches-controls')}>
                <div className={cx('branches-control')}>
                    <SelectBranch handle={handle} />
                </div>
                <div className={cx('branches-control')}>
                    <SelectCompare handle={handle} />
                </div>
            </div>
            <Scrollbars autoHeight={true} autoHeightMin={'calc(100vh - 200px)'}>
                <ul className={cn(cx('branches-diff'), 'branch-compare')}>
                    {renderRows()}
                </ul>
            </Scrollbars>
        </div>
    );
};

export default BranchesScene;
