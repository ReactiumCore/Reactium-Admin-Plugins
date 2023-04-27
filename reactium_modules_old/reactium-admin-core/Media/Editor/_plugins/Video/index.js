import ReactPlayer from 'react-player';
import Reactium, { __ } from 'reactium-core/sdk';
import { Button, Icon } from 'reactium-ui';
import React, { useCallback, useEffect, useState } from 'react';

const Video = ({ editor }) => {
    const { cx, state = {} } = editor;
    const { value = {} } = state;

    const [upload, setUpload] = useState(false);
    const [url, setUrl] = useState(Reactium.Media.url(value.file));

    const cancelUpload = () => {
        editor.cancel();
        setUrl(Reactium.Media.url(value.file));
    };

    const _onFileAdded = e => {
        setUpload(true);
        setUrl(e.file.dataURL);
    };

    const render = useCallback(() => {
        const deleteProps = {
            appearance: Button.ENUMS.APPEARANCE.CIRCLE,
            color: Button.ENUMS.COLOR.DANGER,
            size: Button.ENUMS.SIZE.MD,
            onClick: cancelUpload,
            style: {
                width: 42,
                height: 42,
                padding: 0,
                marginLeft: 12,
            },
        };

        const selectProps = {
            appearance: Button.ENUMS.APPEARANCE.PILL,
            color: Button.ENUMS.COLOR.PRIMARY,
            size: Button.ENUMS.SIZE.MD,
            onClick: editor.browse,
            style: {
                width: 220,
                marginLeft: upload ? 54 : 0,
            },
        };

        return (
            <>
                <div className={cx('filename')}>{value.filename}</div>
                <div className={cx('video')}>
                    <ReactPlayer
                        controls
                        url={url}
                        width='100%'
                        height='100%'
                    />
                    <div className='flex middle'>
                        <Button {...selectProps}>{__('Select Video')}</Button>
                        {upload && (
                            <Button {...deleteProps}>
                                <Icon name='Feather.X' size={18} />
                            </Button>
                        )}
                    </div>
                </div>
            </>
        );
    });

    useEffect(() => {
        editor.addEventListener('FILE-ADDED', _onFileAdded);

        return () => {
            editor.removeEventListener('FILE-ADDED', _onFileAdded);
        };
    }, []);

    return render();
};

export { Video, Video as default };
