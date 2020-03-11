import React from 'react';
import ENUMS from '../enums';
import op from 'object-path';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';

const BranchesScene = props => {
    const { handle } = props;
    const { cx, state } = handle;

    console.log(handle.state);

    return (
        <div className={cx('main')}>
            <div className={cx('main-options')}>
                <div className={cx('main-options-item')}>
                    <Dropdown
                        className='select-dropdown'
                        data={Object.entries(state.branches).map(
                            ([branchId, value]) => ({
                                label: op.get(value, 'label', branchId),
                                value: branchId,
                            }),
                        )}
                        size={Button.ENUMS.SIZE.MD}
                        maxHeight={160}
                        selection={[state.currentBranch]}
                        onChange={({ selection }) => {
                            const [branchId] = selection;
                            handle.setBranch(branchId);
                        }}>
                        <Button
                            size={Button.ENUMS.SIZE.MD}
                            color={Button.ENUMS.COLOR.PRIMARY}
                            title={ENUMS.SELECT_BRANCH.tooltip}
                            data-tooltip={ENUMS.SELECT_BRANCH.tooltip}
                            data-align='top'
                            data-vertical-align='center'
                            data-dropdown-element>
                            <div className={'select-dropdown-label'}>
                                <span>
                                    {op.get(
                                        state.branches,
                                        [state.currentBranch, 'label'],
                                        state.currentBranch,
                                    )}
                                </span>
                                <Icon name='Feather.ChevronDown' />
                            </div>
                        </Button>
                    </Dropdown>
                </div>
                <div className={cx('main-options-item')}>
                    <Dropdown
                        className='select-dropdown'
                        data={Object.entries(state.branches).map(
                            ([branchId, value]) => ({
                                label: op.get(value, 'label', branchId),
                                value: branchId,
                            }),
                        )}
                        size={Button.ENUMS.SIZE.MD}
                        maxHeight={160}
                        selection={[]}
                        onChange={({ selection }) => {
                            const [branchId] = selection;
                            if (branchId) {
                                handle.setBranchContent(branchId, 'compare');
                                handle.navTo('branches');
                            }
                        }}>
                        <Button
                            size={Button.ENUMS.SIZE.MD}
                            color={Button.ENUMS.COLOR.PRIMARY}
                            title={ENUMS.COMPARE_BRANCH.tooltip}
                            data-tooltip={ENUMS.COMPARE_BRANCH.tooltip}
                            data-align='top'
                            data-vertical-align='center'
                            data-dropdown-element>
                            <div className={'select-dropdown-label'}>
                                <span>{ENUMS.COMPARE_BRANCH.label}</span>
                                <Icon name='Feather.ChevronDown' />
                            </div>
                        </Button>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
};

export default BranchesScene;
