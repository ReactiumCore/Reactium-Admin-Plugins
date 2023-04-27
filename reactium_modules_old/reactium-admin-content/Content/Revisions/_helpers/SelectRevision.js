import React from 'react';
import op from 'object-path';
import _ from 'underscore';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import { __ } from 'reactium-core/sdk';
import moment from 'moment';

const SelectBranch = props => {
    const { handle } = props;
    const { state } = handle;
    const history = op.get(state, 'revHistory', {});
    const revisions = op.get(history, 'revisions', []);
    const revId = op.get(state, 'revId');
    const vIndex = revisions.findIndex(({ revId: id }) => id === revId);

    const labels = handle.labels('SELECT_REVISION');
    const revLabel = index => {
        const revision = revisions[index];
        return (index === 0
            ? labels.base
            : index < revisions.length - 1
            ? labels.select
            : labels.current
        )
            .replace('%rev', `v${index + 1}`)
            .replace('%date', moment(revision.updatedAt).fromNow());
    };

    return (
        <Dropdown
            className='select-dropdown'
            data={revisions.map((rev, index) => ({
                label: revLabel(index),
                value: op.get(rev, 'revId'),
            }))}
            size={Button.ENUMS.SIZE.MD}
            maxHeight={160}
            selection={[revId]}
            onChange={({ selection }) => {
                const [id] = selection;
                handle.setState({ revId: id });
            }}>
            <div className='selected-branch'>
                <Button
                    className='selected-branch-button'
                    size={Button.ENUMS.SIZE.MD}
                    color={Button.ENUMS.COLOR.PRIMARY}
                    data-vertical-align='top'
                    data-align='left'
                    data-tooltip={labels.tooltip}
                    data-dropdown-element>
                    <div className={'select-dropdown-label'}>
                        <span>
                            {vIndex > -1 ? revLabel(vIndex) : labels.label}
                        </span>
                        <Icon name='Feather.ChevronDown' />
                    </div>
                </Button>
            </div>
        </Dropdown>
    );
};

export default SelectBranch;
