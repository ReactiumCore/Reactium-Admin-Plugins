import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Reactium, { __ } from 'reactium-core/sdk';
import ENUMS from 'components/Admin/Media/enums';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import React, { useCallback, useEffect, useState } from 'react';

const Audio = ({ editor, ...props }) => {
    const { cx, state = {} } = editor;
    const { value = {} } = state;

    const [initialized, setInitialized] = useState(false);
    const [style, setStyle] = useState({});
    const [upload, setUpload] = useState(false);
    const [url, setUrl] = useState(Reactium.Media.url(value.file));
    const [imageUrl, setImageUrl] = useState();

    const cancelUpload = () => {
        editor.cancel();
        setUrl(Reactium.Media.url(value.file));
    };

    const _onFileAdded = e => {
        const { height: maxHeight, width: maxWidth } = e.file;
        setUpload(true);
        setStyle({ maxHeight, maxWidth });
        setUrl(e.file.dataURL);
    };

    const initialize = () => {
        if (upload !== false) setUpload(false);
        if (initialized !== true) setInitialized(true);

        if (!op.get(value, 'thumbnail')) {
            setImageUrl(null);
            return;
        }

        const newImageUrl = Reactium.Media.url(value.thumbnail);

        const Img = new Image();

        Img.onload = e => {
            const { height: maxHeight, width: maxWidth } = Img;
            setStyle({ maxHeight, maxWidth });
            setImageUrl(newImageUrl);
        };

        Img.src = newImageUrl;
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
                <div className={cx('audio')}>
                    {imageUrl && <img src={imageUrl} style={style} />}
                    {!imageUrl && (
                        <span className={cx('audio-icon')}>
                            <Icon name='Linear.Mic' size={48} />
                        </span>
                    )}
                    <audio width='100%' height='auto' controls>
                        <source src={url} type={`audio/${value.ext}`} />
                        {ENUMS.TEXT.AUDIO_UNSUPPORTED}
                    </audio>
                    <div className='flex middle'>
                        <Button {...selectProps}>{__('Select Audio')}</Button>
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
    });

    useEffect(() => {
        if (initialized === true) return;
        initialize();
    }, []);

    return render();
};

export { Audio, Audio as default };
