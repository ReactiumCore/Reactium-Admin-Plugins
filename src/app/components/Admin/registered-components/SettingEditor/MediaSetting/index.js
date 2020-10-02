import React, { useRef, useState, useEffect } from 'react';
import { useHookComponent, useHandle, __ } from 'reactium-core/sdk';
import op from 'object-path';

const noop = () => {};
const MediaSetting = ({ formRef, helpText = '', config = {} }) => {
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
        const selection = target.selection(values);

        console.log({ values, selection, target, formRef });
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
                    value={[]}
                />

                <small>{helpText}</small>
            </label>
        </div>
    );
};

export default MediaSetting;
