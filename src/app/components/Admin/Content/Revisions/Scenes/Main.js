import React from 'react';
import ENUMS from '../enums';
import op from 'object-path';
import _ from 'underscore';
import { Dialog, Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __ } from 'reactium-core/sdk';

const MainScene = props => {
    const { handle } = props;
    const { cx, state } = handle;
    const currentBranch = op.get(state, 'working.branch');

    const getVersionLabel = branchId =>
        op.get(state, ['branches', branchId, 'label'], 'Unknown');

    const labels = key => ({
        label: ENUMS[key].label.replace(
            '%version',
            getVersionLabel(currentBranch),
        ),
        tooltip: ENUMS[key].tooltip.replace(
            '%version',
            getVersionLabel(currentBranch),
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
            <Dialog
                collapsible={false}
                header={{ title: __('Manage Versions') }}
                className={cx('dialog')}>
                <div className={cx('main-option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={labels('SELECT_BRANCH').tooltip}>
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
                        selection={[currentBranch]}
                        onChange={({ selection }) => {
                            const [branchId] = selection;
                            handle.setBranch(branchId);
                        }}>
                        <div className='selected'>
                            <Button
                                className='selected-settings'
                                size={Button.ENUMS.SIZE.MD}
                                data-vertical-align='top'
                                data-align='left'
                                data-tooltip={labels('SETTINGS').tooltip}
                                onClick={() => handle.navTo('settings')}>
                                <span className='sr-only'>
                                    {labels('SETTINGS').label}
                                </span>
                                <Icon name='Feather.Settings' />
                            </Button>
                            <Button
                                className='selected-button'
                                size={Button.ENUMS.SIZE.MD}
                                color={Button.ENUMS.COLOR.PRIMARY}
                                title={labels('SELECT_BRANCH').tooltip}
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
                </div>

                <div className={cx('main-option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={labels('COMPARE_BRANCH').tooltip}>
                        {labels('COMPARE_BRANCH').label}
                    </h3>
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
                                handle.navTo('branches');
                            }
                        }}>
                        <Button
                            size={Button.ENUMS.SIZE.MD}
                            color={Button.ENUMS.COLOR.PRIMARY}
                            title={labels('COMPARE_BRANCH').tooltip}
                            data-vertical-align='top'
                            data-align='left'
                            data-tooltip={labels('COMPARE_BRANCH').tooltip}
                            data-dropdown-element>
                            <div className={'select-dropdown-label'}>
                                <span>{labels('COMPARE_BRANCH').label}</span>
                                <Icon name='Feather.ChevronDown' />
                            </div>
                        </Button>
                    </Dropdown>
                </div>

                <div className={cx('main-option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={labels('SET_BRANCH').tooltip}>
                        {labels('SET_BRANCH').tooltip}
                    </h3>
                    <Button
                        size={Button.ENUMS.SIZE.MD}
                        color={Button.ENUMS.COLOR.PRIMARY}
                        title={labels('SET_BRANCH').tooltip}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={labels('SET_BRANCH').tooltip}
                        data-dropdown-element
                        disabled={
                            op.get(handle, 'editor.value.history.branch') ===
                            currentBranch
                        }
                        onClick={changeBranch}>
                        {labels('SET_BRANCH').label}
                    </Button>
                </div>

                <div className={cx('main-option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={labels('REVISIONS').tooltip}>
                        {labels('REVISIONS').tooltip}
                    </h3>
                    <Button
                        size={Button.ENUMS.SIZE.MD}
                        color={Button.ENUMS.COLOR.PRIMARY}
                        appearance={'outline'}
                        title={labels('REVISIONS').tooltip}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={labels('REVISIONS').tooltip}
                        onClick={() => {
                            handle.navTo('revisions');
                        }}>
                        {labels('REVISIONS').label}
                    </Button>
                </div>

                <div className={cx('main-option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={labels('CLONE').tooltip}>
                        {labels('CLONE').tooltip}
                    </h3>
                    <Button
                        size={Button.ENUMS.SIZE.MD}
                        appearance={'outline'}
                        color={Button.ENUMS.COLOR.PRIMARY}
                        title={labels('CLONE').tooltip}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={labels('CLONE').tooltip}
                        onClick={() => {
                            handle.cloneBranch();
                            handle.navTo('settings');
                        }}>
                        {labels('CLONE').label}
                    </Button>
                </div>
            </Dialog>
        </div>
    );
};

export default MainScene;
