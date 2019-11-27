import { PDF } from '../Svg';
import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import bytesConvert from '../utils/bytesConvert';
import { Button, Icon, Progress } from '@atomic-reactor/reactium-ui';

export default ({ files, onRemoveFile, uploads, zone }) => {
    const cx = cls => _.compact([`zone-${zone}`, cls]).join('-');

    files = Object.values(files);

    const getType = filename => {
        return String(filename)
            .split('.')
            .pop();
    };

    const isImage = filename =>
        ['png', 'svg', 'gif', 'jpg', 'jpeg'].includes(getType(filename));

    const getIcon = filename => {
        if (isImage(filename)) return null;

        const type = String(getType(filename)).toUpperCase();

        if (ENUMS.TYPE.VIDEO.includes(type))
            return <Icon size={18} name='Linear.FileVideo' />;

        if (ENUMS.TYPE.PDF.includes(type)) return <PDF size={24} />;

        return <Icon name='Linear.FileEmpty' size={24} />;
    };

    const getStyle = (file, filename) =>
        isImage(filename) ? { backgroundImage: `url(${file.dataURL})` } : null;

    return files.length < 1 ? null : (
        <ul>
            {files.map((file, i) => {
                const upload = op.get(uploads, file.ID, {});
                const filename = op.get(file, 'upload.filename');
                const style = getStyle(file, filename);
                const status = op.get(file, 'action');
                const size = op.get(file, 'upload.total', 0);
                const url = op.get(file, 'url', '...');
                const progress =
                    status === ENUMS.STATUS.COMPLETE
                        ? 1
                        : op.get(upload, 'progress', 0);
                return (
                    <li
                        id={`upload-${file.ID}`}
                        key={`media-upload-${i}`}
                        className={cn(status, cx('upload'))}>
                        <div
                            className={cn(status, cx('upload-image'))}
                            children={getIcon(filename)}
                            style={style}
                        />
                        <div className={cn(status, cx('upload-info'))}>
                            <div className={cx('upload-name')}>
                                {filename}
                                {' • '}
                                <span className={cx('upload-size')}>
                                    {bytesConvert(size)}
                                </span>
                            </div>
                            <div style={{ width: 150 }}>
                                <Progress
                                    size='xs'
                                    color='primary'
                                    value={progress}
                                    appearance='pill'
                                />
                            </div>
                            <div className={cx('upload-url')}>{url}</div>
                        </div>
                        <div className={cn(status, cx('upload-status'))}>
                            {status}
                        </div>
                        <div className={cn(status, cx('upload-action'))}>
                            {status === ENUMS.STATUS.COMPLETE && (
                                <Button
                                    size='xs'
                                    color='primary'
                                    appearance='circle'
                                    onClick={() => onRemoveFile(file)}>
                                    <Icon name='Feather.Check' size={18} />
                                </Button>
                            )}

                            {status === ENUMS.STATUS.QUEUED && (
                                <Button
                                    onClick={() => onRemoveFile(file)}
                                    size='xs'
                                    color='danger'
                                    appearance='circle'>
                                    <Icon name='Feather.X' size={18} />
                                </Button>
                            )}

                            {status === ENUMS.STATUS.UPLOADING && (
                                <Button
                                    size='xs'
                                    color='primary'
                                    disabled
                                    appearance='circle'>
                                    <Icon name='Feather.ArrowUp' size={18} />
                                </Button>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};
