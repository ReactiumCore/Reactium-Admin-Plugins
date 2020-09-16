import React, { useState, useEffect } from 'react';
import { useHookComponent, useHandle, __ } from 'reactium-core/sdk';
import op from 'object-path';

const noop = () => {};
const MediaSetting = ({ config = {} }) => {
    const MediaPicker = useHookComponent('MediaPicker');
    const tools = useHandle('AdminTools');
    const Toast = op.get(tools, 'Toast');
    const Modal = op.get(tools, 'Modal');
    const pickerOptions = op.get(config, 'pickerOptions', {
        maxSelect: 1,
        filter: 'IMAGE',
        title: __('Select Media'),
    });

    const showPicker = () => {
        Modal.show(
            <MediaPicker
                confirm={true}
                dismissable
                onSubmit={noop}
                onDismiss={() => Modal.hide()}
                {...pickerOptions}
            />,
        );
    };

    useEffect(() => {
        showPicker();
    });

    return 'MediaPicker';
};

export default MediaSetting;
