import React, { useState, useEffect } from 'react';
import ENUMS from '../enums';
import op from 'object-path';
import _ from 'underscore';
import { Dialog, Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __ } from 'reactium-core/sdk';

const SettingsScene = props => {
    const { handle } = props;
    const { cx, state } = handle;
    const currentBranch = op.get(state, 'working.branch');

    const getVersionLabel = branchId =>
        op.get(state, ['branches', branchId, 'label'], 'Unknown');

    const [branchSettings, updateSettings] = useState({
        currentBranch,
        label: getVersionLabel(currentBranch),
    });

    useEffect(() => {
        updateSettings({
            currentBranch,
            label: getVersionLabel(currentBranch),
        });
    }, [currentBranch]);

    const labels = handle.labels('SET_LABEL');
    const deleteLabels = handle.labels('DELETE_LABEL');

    return (
        <div className={cx('settings')}>
            <Dialog
                header={{ title: __('Branch Label') }}
                className={cx('dialog')}
                collapsible={false}>
                <div className={cx('option')}>
                    <h3
                        className={'h5 pb-xs-8'}
                        data-vertical-align='top'
                        data-align='left'
                        data-tooltip={labels.tooltip}>
                        {labels.tooltip}
                    </h3>
                    <div className='version-id pb-xs-4'>
                        <strong>{__('Version ID:')}</strong>{' '}
                        <span>{currentBranch}</span>
                    </div>
                    <div className='form-group pb-xs-16'>
                        <input
                            type='text'
                            autoComplete='off'
                            placeholder={labels.placeholder}
                            value={branchSettings.label}
                            onTouchStart={e => e.target.select()}
                            onClick={e => e.target.select()}
                            onChange={e =>
                                updateSettings({
                                    currentBranch: branchSettings.currentBranch,
                                    label: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className='pb-xs-16'>
                        <Button
                            size={Button.ENUMS.SIZE.MD}
                            color={Button.ENUMS.COLOR.PRIMARY}
                            title={labels.tooltip}
                            data-vertical-align='top'
                            data-align='left'
                            data-tooltip={labels.tooltip}
                            data-dropdown-element
                            disabled={
                                !branchSettings.label ||
                                branchSettings.label.length < 1
                            }
                            onClick={() => {
                                handle.labelBranch(branchSettings.label);
                                handle.navTo('main');
                            }}>
                            {labels.label}
                        </Button>
                    </div>
                    {currentBranch !== 'master' && (
                        <div className='pb-xs-16'>
                            <Button
                                size={Button.ENUMS.SIZE.MD}
                                color={Button.ENUMS.COLOR.WARNING}
                                title={deleteLabels.tooltip}
                                data-vertical-align='top'
                                data-align='left'
                                data-tooltip={deleteLabels.tooltip}
                                data-dropdown-element
                                disabled={currentBranch === 'master'}
                                onClick={() => {
                                    handle.navTo('delete');
                                }}>
                                {deleteLabels.label}
                            </Button>
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default SettingsScene;
