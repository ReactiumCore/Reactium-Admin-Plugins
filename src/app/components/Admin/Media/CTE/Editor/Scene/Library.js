import op from 'object-path';
import React, { useEffect, useState } from 'react';

import { __, useHookComponent } from 'reactium-core/sdk';

export default ({ handle, ...props }) => {
    const { active, add, cx, editor, isActive, back, max, refs, type } = handle;

    const MediaPicker = useHookComponent('MediaPicker');

    const [ready, updateReady] = useState(isActive(props.id));

    const setReady = newReady => {
        if (editor.unMounted()) return;
        updateReady(newReady);
    };

    const _onSubmit = async ({ selection }) => {
        if (selection.length < 1) return;
        add(selection);
    };

    const _onDismiss = async e => {
        await back();
        const picker = e ? e.currentTarget : refs.get('library.picker');
        picker.setStatus(picker.ENUMS.STATUS.PENDING, true);
    };

    const _onLoad = ({ data }) => {
        if (!op.get(editor.state, 'media')) {
            editor.setState({ media: data });
        }
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
                        confirm={max !== 1}
                        data={op.get(editor.state, 'media')}
                        debug={false}
                        delayFetch={1000}
                        dismissable
                        filters={type}
                        maxSelect={max}
                        onLoad={_onLoad}
                        onSubmit={_onSubmit}
                        onDismiss={_onDismiss}
                        ref={elm => refs.set('library.picker', elm)}
                        title={__('Media Library')}
                    />
                ) : null}
            </div>
        );
    };

    return render();
};
