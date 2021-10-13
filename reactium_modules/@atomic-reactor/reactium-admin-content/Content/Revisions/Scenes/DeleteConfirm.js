import React, { useState, useEffect } from 'react';
import ENUMS from '../enums';
import op from 'object-path';
import _ from 'underscore';
import { Dialog, Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const DeleteConfirm = props => {
    const { handle } = props;
    const { cx, state } = handle;
    const currentBranch = op.get(state, 'working.branch');
    const ConfirmBox = useHookComponent('ConfirmBox');
    const getVersionLabel = branchId =>
        op.get(state, ['branches', branchId, 'label'], branchId);

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

    return (
        <div className={cx('settings')}>
            <ConfirmBox
                title={__('Confirm Delete')}
                message={__(
                    'Are you sure you wish to delete version %version?',
                ).replace('%version', branchSettings.label)}
                onCancel={() => handle.navTo('settings', 'right')}
                onConfirm={() => handle.deleteBranch()}
            />
        </div>
    );
};

export default DeleteConfirm;
