import React, { useState, useEffect } from 'react';
import { __ } from 'reactium-core/sdk';

import { Button, Icon } from '@atomic-reactor/reactium-ui';

import op from 'object-path';
import _ from 'underscore';
import cn from 'classnames';
import moment from 'moment';
import ENUMS from './enums';

const PublishButton = props => {
    const { editor, config } = props;
    const dirtyCheck = props.dirtyCheck;
    const [statusState, setStatusState] = useState({
        currentStatus: op.get(editor, 'value.status'),
        updatedAt: moment(op.get(editor, 'value.updatedAt')),
    });

    const { currentStatus, updatedAt } = statusState;

    const updateStatus = update => {
        const newStatusState = {
            ...statusState,
            ...update,
        };
        setStatusState(newStatusState);
    };

    const _contentStatusEventHandler = e => {
        if (!e.value) return;
        const { value } = e;
        const { currentStatus, updatedAt } = statusState;

        if (currentStatus !== value.status) {
            updateStatus({
                currentStatus: value.status,
                updatedAt: moment(value.updatedAt),
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
    }, [editor, currentStatus]);

    let mode,
        disabled = false;

    if (!config.can.publish && !config.can.unpublish) {
        mode = ENUMS.BUTTON_MODES.DISABLED;
        disabled = true;
    } else if (currentStatus === 'PUBLISHED') {
        mode = ENUMS.BUTTON_MODES.UNPUBLISH;
        if (!config.can.unpublish) disabled = true;
    } else if (currentStatus !== 'PUBLISHED') {
        mode = ENUMS.BUTTON_MODES.PUBLISH;
        if (!config.can.publish) disabled = true;
    }

    const updatedLabel = __('Updated: %updated')
        .split('%updated')
        .map(item => {
            if (item.length)
                return (
                    <strong key='updated'>
                        <Icon name='Linear.CalendarFull' /> {item}
                    </strong>
                );
            return (
                <span className='updated-at' key='updated-at'>
                    {updatedAt.fromNow()}
                </span>
            );
        });

    return (
        <div className='publish-button'>
            {mode !== ENUMS.BUTTON_MODES.DISABLED && (
                <Button
                    disabled={!mode.action || disabled}
                    appearance={Button.ENUMS.APPEARANCE.PILL}
                    size={Button.ENUMS.SIZE.MD}
                    color={Button.ENUMS.COLOR.PRIMARY}
                    title={mode.tooltip}
                    data-tooltip={mode.tooltip}
                    onClick={dirtyCheck(() => editor.publish(mode.action))}>
                    {mode.text}
                </Button>
            )}
            <div
                className='publish-button-updated'
                data-tooltip={__('Last Updated')}>
                {updatedLabel}
            </div>
        </div>
    );
};

export default PublishButton;
