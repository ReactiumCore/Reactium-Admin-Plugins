import React, { useRef, useEffect } from 'react';
import { useHookComponent } from '@atomic-reactor/reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';

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

    const onSelected = (values) => {
        const selection = mediaToolRef.current.selection(values);
        updateValue(selection, false);
    };

    useEffect(() => {
        if (mediaToolRef.current && Array.isArray(value)) {
            const tool = mediaToolRef.current;
            const current = _.pluck(tool.value, 'url').sort();
            const next = _.pluck(value, 'url').sort();
            const left = _.difference(current, next);
            const right = _.difference(next, current);
            if (!_.isEmpty(left) || !_.isEmpty(right)) {
                mediaToolRef.current.setSelection(value);
            }
        }
    }, [value]);

    return (
        <div className={'form-group'}>
            <label>
                <span aria-label={config.tooltip}>{config.label}</span>

                <MediaTool
                    ref={mediaToolRef}
                    onSelection={onSelected}
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
