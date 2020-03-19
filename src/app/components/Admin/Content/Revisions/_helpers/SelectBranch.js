import React from 'react';
import op from 'object-path';
import _ from 'underscore';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import { __ } from 'reactium-core/sdk';

const SelectBranch = props => {
    const { handle } = props;
    const { state } = handle;
    const currentBranch = op.get(state, 'working.branch');

    return (
        <Dropdown
            className='select-dropdown'
            data={Object.entries(state.branches).map(([branchId, value]) => ({
                label: op.get(value, 'label', branchId),
                value: branchId,
            }))}
            size={Button.ENUMS.SIZE.MD}
            maxHeight={160}
            selection={[currentBranch]}
            onChange={({ selection }) => {
                const [branchId] = selection;
                handle.setBranch(branchId);
            }}>
            <div className='selected-branch'>
                <Button
                    className='selected-branch-settings'
                    size={Button.ENUMS.SIZE.MD}
                    data-vertical-align='top'
                    data-align='left'
                    data-tooltip={handle.labels('SETTINGS').tooltip}
                    onClick={() => handle.navTo('settings')}>
                    <span className='sr-only'>
                        {handle.labels('SETTINGS').label}
                    </span>
                    <Icon name='Feather.Settings' />
                </Button>
                <Button
                    className='selected-branch-button'
                    size={Button.ENUMS.SIZE.MD}
                    color={Button.ENUMS.COLOR.PRIMARY}
                    data-vertical-align='top'
                    data-align='left'
                    data-tooltip={handle.labels('SELECT_BRANCH').tooltip}
                    data-dropdown-element>
                    <div className={'select-dropdown-label'}>
                        <span>
                            {op.get(
                                state.branches,
                                [currentBranch, 'label'],
                                currentBranch,
                            )}
                        </span>
                        <Icon name='Feather.ChevronDown' />
                    </div>
                </Button>
            </div>
        </Dropdown>
    );
};

export default SelectBranch;
