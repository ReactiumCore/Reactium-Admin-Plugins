import React from 'react';
import op from 'object-path';
import _ from 'underscore';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import { __ } from 'reactium-core/sdk';

const SelectCompare = props => {
    const { handle } = props;
    const { state } = handle;
    const currentBranch = op.get(state, 'working.branch');
    const compareBranch = op.get(state, 'compare.branch');

    return (
        <Dropdown
            className='select-dropdown'
            data={Object.entries(state.branches)
                // exclude the current branch
                .filter(([branch]) => branch !== currentBranch)
                .map(([branchId, value]) => ({
                    label: op.get(value, 'label', branchId),
                    value: branchId,
                }))}
            size={Button.ENUMS.SIZE.MD}
            maxHeight={160}
            selection={[]}
            onChange={({ selection }) => {
                const [branchId] = selection;
                if (branchId) {
                    handle.setBranch(branchId, 'compare');
                    if (state.activeScene !== 'branches')
                        handle.navTo('branches');
                }
            }}>
            <Button
                size={Button.ENUMS.SIZE.MD}
                color={Button.ENUMS.COLOR.PRIMARY}
                title={handle.labels('COMPARE_BRANCH').tooltip}
                data-vertical-align='top'
                data-align='left'
                data-tooltip={handle.labels('COMPARE_BRANCH').tooltip}
                data-dropdown-element>
                <div className={'select-dropdown-label'}>
                    <span>
                        {op.get(
                            state.branches,
                            [compareBranch, 'label'],
                            handle.labels('COMPARE_BRANCH').label,
                        )}
                    </span>
                    <Icon name='Feather.ChevronDown' />
                </div>
            </Button>
        </Dropdown>
    );
};

export default SelectCompare;
