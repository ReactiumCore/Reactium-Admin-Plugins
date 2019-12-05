import { PDF } from '../Svg';
import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import bytesConvert from '../utils/bytesConvert';
import { Button, Icon, Progress } from '@atomic-reactor/reactium-ui';

export default ({ onRemoveFile, uploads, zone }) => {
    const cx = cls => _.compact([`admin-media`, cls]).join('-');

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
            return <Icon size={36} name='Linear.FileVideo' />;

        if (ENUMS.TYPE.PDF.includes(type)) return <PDF size={36} />;

        return <Icon name='Linear.FileEmpty' size={36} />;
    };

    const getStyle = ({ file, filename }) =>
        isImage(filename) ? { backgroundImage: `url(${file.dataURL})` } : null;

    return Object.values(uploads).length < 1 ? null : (
        <ul>
            {Object.values(uploads).map((upload, i) => {
                const file = op.get(upload, 'file');
                const filename = op.get(upload, 'filename');
                const style = getStyle({ file, filename });
                const status = op.get(upload, 'status');
                const size = bytesConvert(op.get(upload, 'total', 0));
                const url = op.get(upload, 'url', '...');

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
                                    {size}
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
