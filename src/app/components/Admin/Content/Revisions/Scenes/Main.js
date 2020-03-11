import React from 'react';
import ENUMS from '../enums';
import op from 'object-path';
import _ from 'underscore';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import Reactium from 'reactium-core/sdk';

const BranchesScene = props => {
    const { handle } = props;
    const { cx, state } = handle;

    const getVersionLabel = branchId =>
        op.get(state, ['branches', branchId, 'label'], 'Unknown');

    const labels = key => ({
        label: ENUMS[key].label.replace(
            '%version',
            getVersionLabel(op.get(state, 'currentBranch')),
        ),
        tooltip: ENUMS[key].tooltip.replace(
            '%version',
            getVersionLabel(op.get(state, 'currentBranch')),
        ),
    });

    const changeBranch = async () => {
        const value = op.get(state, 'working.content', {});

        // handle.editor.setValue(value);
        await handle.editor.dispatch('load', {
            value,
            ignoreChangeEvent: true,
        });

        handle.onClose();

        _.defer(() => {
            const type = op.get(handle, 'editor.type');
            const slug = op.get(value, 'slug');
            const branch = op.get(value, 'history.branch');

            if (branch === 'master') {
                Reactium.Routing.history.push(
                    `/admin/content/${type}/${slug}?debug=true`,
                );
            } else {
                Reactium.Routing.history.push(
                    `/admin/content/${type}/${slug}/branch/${branch}?debug=true`,
                );
            }
        });
    };

    return (
        <div className={cx('main')}>
            <div className={cx('main-options')}>
                <div className={cx('main-options-item')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-tooltip={labels('SELECT_BRANCH').tooltip}
                        data-align='top'
                        data-vertical-align='center'>
                        {labels('SELECT_BRANCH').label}
                    </h3>
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
                            title={labels('SELECT_BRANCH').tooltip}
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
                    <h3
                        className={'h5 pb-xs-8'}
                        data-tooltip={labels('COMPARE_BRANCH').tooltip}
                        data-align='top'
                        data-vertical-align='center'>
                        {labels('COMPARE_BRANCH').label}
                    </h3>
                    <Dropdown
                        className='select-dropdown'
                        data={Object.entries(state.branches)
                            // exclude the current branch
                            .filter(
                                ([branch]) =>
                                    branch !==
                                    op.get(handle, 'state.currentBranch'),
                            )
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
                                handle.setBranchContent(branchId, 'compare');
                                handle.navTo('branches');
                            }
                        }}>
                        <Button
                            size={Button.ENUMS.SIZE.MD}
                            color={Button.ENUMS.COLOR.PRIMARY}
                            title={labels('COMPARE_BRANCH').tooltip}
                            data-tooltip={labels('COMPARE_BRANCH').tooltip}
                            data-align='top'
                            data-vertical-align='center'
                            data-dropdown-element>
                            <div className={'select-dropdown-label'}>
                                <span>{labels('COMPARE_BRANCH').label}</span>
                                <Icon name='Feather.ChevronDown' />
                            </div>
                        </Button>
                    </Dropdown>
                </div>

                <div className={cx('main-options-item')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-tooltip={labels('SET_BRANCH').tooltip}
                        data-align='top'
                        data-vertical-align='center'>
                        {labels('SET_BRANCH').tooltip}
                    </h3>
                    <Button
                        size={Button.ENUMS.SIZE.MD}
                        color={Button.ENUMS.COLOR.PRIMARY}
                        title={labels('SET_BRANCH').tooltip}
                        data-tooltip={labels('SET_BRANCH').tooltip}
                        data-align='top'
                        data-vertical-align='center'
                        data-dropdown-element
                        disabled={
                            op.get(handle, 'editor.value.history.branch') ===
                            op.get(state, 'currentBranch')
                        }
                        onClick={changeBranch}>
                        {labels('SET_BRANCH').label}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BranchesScene;
