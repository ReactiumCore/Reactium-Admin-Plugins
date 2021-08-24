import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Reactium, { __ } from 'reactium-core/sdk';
import ENUMS from 'reactium_modules/@atomic-reactor/reactium-admin-core/Media/enums';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import React, { useCallback, useEffect, useState } from 'react';

const File = ({ editor, ...props }) => {
    const { cx, state = {} } = editor;
    const { value = {} } = state;

    const [upload, setUpload] = useState(false);
    const [url, setUrl] = useState(Reactium.Media.url(value.file));

    const cancelUpload = () => {
        editor.cancel();
        setUrl(Reactium.Media.url(value.file));
    };

    const _onFileAdded = e => {
        const { height: maxHeight, width: maxWidth } = e.file;
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
                <div className={cx('file')}>
                    <a href={url} target='_blank' className={cx('file-icon')}>
                        <Icon name='Linear.FileEmpty' />
                    </a>
                    <div className='flex middle'>
                        <Button {...selectProps}>{__('Select File')}</Button>
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

    return render();
};

export { File, File as default };
