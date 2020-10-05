import React, { useRef, useState, useEffect } from 'react';
import { useHookComponent, useHandle, __ } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';

const noop = () => {};
const MediaSetting = ({
    name,
    value = [],
    updateValue,
    helpText = '',
    config = {},
}) => {
    const mediaToolRef = useRef();
    const MediaTool = useHookComponent('MediaTool');
    const defaultPickerOptions = op.get(
        MediaTool,
        'ENUMS.defaultPickerOptions',
        {},
    );
    const directory = op.get(config, 'directory', 'uploads') || 'uploads';
    const pickerOptions = op.get(config, 'pickerOptions', defaultPickerOptions);

    const onSelected = e => {
        const values = e.values;
        const target = e.target;
        updateValue(target.selection(values));
    };

    useEffect(() => {
        let cleanup = [];

        // mediaTool listeners
        if (mediaToolRef.current) {
            mediaToolRef.current.addEventListener('media-selected', onSelected);
            cleanup.push(() =>
                mediaToolRef.current.removeEventListener(
                    'media-selected',
                    onSelected,
                ),
            );
        }

        return () => cleanup.forEach(cb => cb());
    }, [mediaToolRef.current]);

    useEffect(() => {
        if (mediaToolRef.current && Array.isArray(value)) {
            const tool = mediaToolRef.current;
            const current = _.pluck(tool.value, 'url').sort();
            const next = _.pluck(value, 'url').sort();
            const left = _.difference(current, next);
            const right = _.difference(next, current);
            if (!_.isEmpty(left) || !_.isEmpty(right)) {
                tool.setSelection(value);
            }
        }
    }, [value]);

    return (
        <div className={'form-group'}>
            <label>
                <span data-tooltip={config.tooltip} data-align='left'>
                    {config.label}
                </span>

                <MediaTool
                    ref={mediaToolRef}
                    pickerOptions={pickerOptions}
                    directory={directory}
                    value={value}
                />

                <small>{helpText}</small>
            </label>
        </div>
    );
};

export default MediaSetting;
