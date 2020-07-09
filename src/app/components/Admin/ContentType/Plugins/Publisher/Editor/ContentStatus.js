import React, { useState, useRef, useEffect } from 'react';
import { __ } from 'reactium-core/sdk';

import { Button, Icon, Dialog, Dropdown } from '@atomic-reactor/reactium-ui';

import op from 'object-path';
import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';

const ContentStatus = props => {
    const ddRef = useRef();
    const { editor, config } = props;
    const simple = op.get(config, 'simple', false);
    const [statusState, setStatusState] = useState({
        currentStatus: op.get(editor, 'value.status'),
        selectedStatus: op.get(editor, 'value.status'),
    });
    const dirtyCheck = props.dirtyCheck;

    const { currentStatus, selectedStatus } = statusState;
    const statusLabel = __('Status: %status')
        .split('%status')
        .map(label => {
            if (label.length) return <span key='status-label'>{label}</span>;
            else return <strong key={currentStatus}>{currentStatus}</strong>;
        });

    const updateStatus = status => {
        const newStatusState = {
            ...statusState,
            ...status,
        };
        setStatusState(newStatusState);
    };

    const statuses = config.statuses.filter(
        status => config.can.status[status],
    );

    const _contentStatusEventHandler = e => {
        if (!e.value) return;
        const { value } = e;
        const { currentStatus, updatedAt } = statusState;

        if (currentStatus !== value.status) {
            updateStatus({
                currentStatus: value.status,
                selectedStatus: value.status,
            });
        }
    };

    // On submit handler
    useEffect(() => {
        if (editor.unMounted()) return;
        editor.addEventListener('clean', _contentStatusEventHandler);

        return () => {
            editor.removeEventListener('clean', _contentStatusEventHandler);
        };
    }, [editor, statusState]);

    const canChangeStatus = () => {
        // simple workflow
        if (simple) return false;
        // no extra statuses
        if (!statuses.length) return false;
        // can't change status if published
        if (currentStatus === 'PUBLISHED') return false;

        return true;
    };

    if (!currentStatus) return null;

    if (!canChangeStatus()) {
        return <div className='status-label'>{statusLabel}</div>;
    }

    return (
        <Dialog
            pref='admin.dialog.publisher.status'
            className={'publish-status-dialog'}
            header={{
                title: <div className='status-label'>{statusLabel}</div>,
            }}
            dismissable={false}>
            <div className={'publish-status-dialog-content'}>
                <Dropdown
                    ref={ddRef}
                    className='publish-status-dropdown'
                    data={statuses.map(status => ({
                        label: status,
                        value: status,
                    }))}
                    maxHeight={160}
                    selection={[selectedStatus]}
                    onChange={val => {
                        const selectedStatus = op.get(val, 'item.value');
                        if (selectedStatus)
                            updateStatus({
                                selectedStatus,
                            });
                    }}>
                    <Button
                        color={Button.ENUMS.COLOR.TERTIARY}
                        data-dropdown-element>
                        <div className={'publish-status-dropdown-label'}>
                            <span>{selectedStatus}</span>
                            <Icon name='Feather.ChevronDown' />
                        </div>
                    </Button>
                </Dropdown>
                <Button
                    disabled={currentStatus === selectedStatus}
                    className='publish-status-set'
                    color={Button.ENUMS.COLOR.PRIMARY}
                    data-dropdown-element
                    onClick={dirtyCheck(() =>
                        editor.setContentStatus(selectedStatus),
                    )}>
                    {ENUMS.BUTTON_MODES.SET_STATUS.text}
                </Button>
            </div>
        </Dialog>
    );
};

export default ContentStatus;
