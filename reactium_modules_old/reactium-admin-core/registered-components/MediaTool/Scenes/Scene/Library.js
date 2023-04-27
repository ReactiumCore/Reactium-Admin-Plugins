import React, { useEffect, useState } from 'react';
import op from 'object-path';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';
import ENUMS from '../../enums';

const Library = ({ handle, ...props }) => {
    const {
        active,
        add,
        cx,
        isActive,
        back,
        refs,
        onCloseSelect,
        pickerOptions: po = {},
    } = handle;
    const max = op.get(pickerOptions, 'max', 1);
    const pickerOptions = {
        ...ENUMS.defaultPickerOptions,
        ...po,
    };

    const MediaPicker = useHookComponent('MediaPicker');

    const [ready, updateReady] = useState(isActive(props.id));

    const setReady = newReady => {
        updateReady(newReady);
    };

    const _onSubmit = async ({ selection }) => {
        if (selection.length < 1) return;
        add(selection);
        onCloseSelect();
    };

    const _onDismiss = async e => {
        await back();
        const picker = e ? e.currentTarget : refs.get('library.picker');
        picker.setStatus(picker.ENUMS.STATUS.PENDING, true);
    };

    const _onLoad = ({ data }) => {
        const media = Reactium.Cache.get('editor.media');
        if (!media) Reactium.Cache.set('editor.media', data);
    };

    useEffect(() => {
        if (!isActive(props.id)) {
            if (ready !== false) setReady(false);
            return;
        }

        setReady(true);
    }, [active]);

    const render = () => {
        return (
            <div className={cx('library')}>
                {ready ? (
                    <MediaPicker
                        data={Reactium.Cache.get('editor.media')}
                        debug={false}
                        delayFetch={1000}
                        dismissable
                        onLoad={_onLoad}
                        onSubmit={_onSubmit}
                        onDismiss={_onDismiss}
                        ref={elm => refs.set('library.picker', elm)}
                        title={__('Media Library')}
                        {...pickerOptions}
                        confirm={!!op.get(pickerOptions, 'confirm', max !== 1)}
                    />
                ) : null}
            </div>
        );
    };

    return render();
};

export default Library;
