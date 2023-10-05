import _ from 'underscore';
import cn from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { fileExtensions } from '../fileExtensions';

import Reactium, {
    __,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

export const fileSize = (x) => {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    let l = 0,
        n = parseInt(x, 10) || 0;

    while (n >= 1024 && ++l) {
        n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
};

const UploaderPreviewThumbnail = ({ className, file }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    const ext = String(file.name).toLowerCase().split('.').pop();
    let { type } = _.findWhere(fileExtensions, { value: ext });

    switch (type) {
        case 'image':
            return (
                <div
                    className={className}
                    style={{ backgroundImage: `url(${file.dataURL})` }}
                />
            );

        case 'archive':
            return (
                <div
                    className={className}
                    children={<Icon name='Linear.Cube' />}
                />
            );

        case 'audio':
            return (
                <div
                    className={className}
                    children={<Icon name='Linear.Mic' />}
                />
            );

        case 'video':
            return (
                <div
                    className={className}
                    children={<Icon name='Linear.ClapboardPlay' />}
                />
            );

        default:
            return (
                <div
                    className={className}
                    children={<Icon name='Linear.Document2' />}
                />
            );
    }
};

UploaderPreviewThumbnail.defaultProps = {
    className: 'thumb',
};

export const UploaderPreview = ({ namespace, files, uploads, uploader }) => {
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const cx = useMemo(() => Reactium.Utils.cxFactory(namespace), [namespace]);

    const visible = useMemo(
        () => uploader && (files.length > 0 || uploads.length > 0),
        [uploader, uploads, files],
    );

    return !visible ? null : (
        <div className={cx('list')}>
            {uploads.map((item, i) => (
                <div key={cx(`list-item-${i}`)} className={cx('list-item')}>
                    <div className={cn(cx('list-item-col'))}>
                        <UploaderPreviewThumbnail file={item} />
                    </div>
                    <div className={cn(cx('list-item-col'), 'info')}>
                        <div>{item.name}</div>
                        <small>{fileSize(item.size)}</small>
                    </div>
                    <div className={cn(cx('list-item-col'), 'action')}>
                        <button className='btn-danger-md' type='button'>
                            <Icon name='Feather.X' />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UploaderPreview;

UploaderPreview.propTypes = {
    files: PropTypes.array,
    namespace: PropTypes.string,
    uploads: PropTypes.array,
};

UploaderPreview.defaultProps = {
    files: [],
    namespace: 'ar-field-type-file-preview',
    uploads: [],
};
