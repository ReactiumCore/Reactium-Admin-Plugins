import React, { useEffect, useState, useRef } from 'react';
import { Checkbox, Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useHookComponent, __ } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';
import slugify from 'slugify';
import isHotkey from 'is-hotkey';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PublisherFT
 * -----------------------------------------------------------------------------
 */
const PublisherFieldType = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);
    const addStatusRef = useRef();
    const addStatusLabel = __('Enter a content status label');
    const addStatusButtonLabel = __('Add content status label');
    const removeStatusButtonLabel = __('Remove content status label');
    const requiredStatuses = ['PUBLISHED', 'DRAFT'];
    const [statuses, _setStatus] = useState(requiredStatuses);

    const updatedStatuses = (values = []) => {
        const updated = _.chain(requiredStatuses.concat(values))
            .uniq()
            .compact()
            .value()
            .sort();

        _setStatus(updated);
    };

    useEffect(() => {
        const hookId = Reactium.Hook.register(
            'field-type-form-change-publisher',
            async e => {
                if (e.value) {
                    const value = e.value;
                    updatedStatuses(op.get(value, 'statuses', '').split(','));
                }
            },
        );

        return () => {
            Reactium.Hook.unregister(hookId);
        };
    });

    const onAddStatus = e => {
        const value = addStatusRef.current.value || '';
        if (value.length) {
            updatedStatuses([
                ...statuses,
                slugify(value, {
                    replacement: '_', // replace spaces with replacement
                    remove: /[^A-Za-z0-9_\s]/g, // regex to remove characters
                }).toUpperCase(),
            ]);
            addStatusRef.current.value = '';
        }
    };

    const onRemoveStatus = remove => e => {
        updatedStatuses([...statuses.filter(status => status !== remove)]);
    };

    return (
        <FieldTypeDialog {...props}>
            <div className='publisher-settings'>
                <input
                    type='hidden'
                    name='statuses'
                    value={statuses.join(',')}
                />

                <div className='statuses'>
                    <div className='statuses-add input-group'>
                        <label className='sr-only' htmlFor='add-status'>
                            {addStatusLabel}
                        </label>
                        <input
                            id='add-status'
                            type='text'
                            placeholder={addStatusLabel}
                            ref={addStatusRef}
                            onKeyDown={e => {
                                if (isHotkey('enter', e)) {
                                    e.preventDefault();
                                    onAddStatus();
                                }
                            }}
                        />
                        <Button
                            title={addStatusButtonLabel}
                            size={Button.ENUMS.SIZE.SM}
                            color={Button.ENUMS.COLOR.TERTIARY}
                            style={{ height: 41 }}
                            onClick={onAddStatus}>
                            <Icon.Feather.Plus />
                            <span className='sr-only'>
                                {addStatusButtonLabel}
                            </span>
                        </Button>
                    </div>

                    <ul className='statuses-list'>
                        {statuses.map(status => {
                            const required = requiredStatuses.includes(status);
                            return (
                                <li className='statuses-list-item' key={status}>
                                    <div className='statuses-status'>
                                        {status}
                                    </div>
                                    <Button
                                        title={removeStatusButtonLabel}
                                        size={Button.ENUMS.SIZE.SM}
                                        color={
                                            required
                                                ? Button.ENUMS.COLOR.TERTIARY
                                                : Button.ENUMS.COLOR.ERROR
                                        }
                                        disabled={required}
                                        onClick={onRemoveStatus(status)}>
                                        <Icon.Feather.X />
                                        <span className='sr-only'>
                                            {removeStatusButtonLabel}
                                        </span>
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className={'input-group'}>
                    <div className='slider-check'>
                        <Checkbox
                            name='simple'
                            label={__('Simple Flow')}
                            labelAlign={'left'}
                            value={true}
                        />
                    </div>
                </div>
            </div>
        </FieldTypeDialog>
    );
};

export default PublisherFieldType;
