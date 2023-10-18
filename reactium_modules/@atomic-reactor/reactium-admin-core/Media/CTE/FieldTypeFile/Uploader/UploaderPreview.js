import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { fileExtensions } from '../fileExtensions';
import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
} from 'react';

import Reactium, {
    useHookComponent,
    useSyncState,
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

export const UploaderPreview = forwardRef((props, ref) => {
    const { count, namespace, fieldName, files, serialize, uploader, uploads } =
        props;

    const state = useSyncState({
        uploading: [],
    });

    const Zone = useHookComponent('Zone');

    const cx = useMemo(() => Reactium.Utils.cxFactory(namespace), [namespace]);

    const visible = useMemo(() => count > 0, [count]);

    const getType = useCallback((name) => {
        const value = String(name).toLowerCase().split('.').pop();
        const { type } = _.findWhere(fileExtensions, { value });
        return type;
    }, []);

    const uploading = (FILEID) =>
        Array.from(state.get('uploading') || []).includes(FILEID);

    const upload = (FILEIDS) => {
        const _uploading = Array.from(state.get('uploading') || []);

        FILEIDS = _.chain([FILEIDS]).flatten().compact().uniq().value();

        FILEIDS.forEach((FILEID) => _uploading.push(FILEID));

        state.set('uploading', _uploading);

        return state;
    };

    state.extend('uploading', upload);

    uploader.extend('getType', getType);

    uploader.extend('uploading', uploading);

    const zoneProps = useMemo(
        () => ({
            count,
            cx,
            fieldName,
            files,
            namespace,
            serialize,
            uploader,
            uploads,
            visible,
        }),
        [props],
    );

    useImperativeHandle(ref, () => state);

    return !visible ? null : (
        <div className={cx('list')}>
            <Zone {...zoneProps} zone={'media-editor-preview-top'} />
            <Zone
                {...zoneProps}
                zone={`media-editor-preview-top-${uploader.getAttribute(
                    'fieldName',
                )}`}
            />
            {uploads.map((item, i) => (
                <div
                    key={cx(`list-item-${i}-${uploading(item.ID)}`)}
                    className={cn(cx('list-item'), getType(item.name))}
                >
                    <div className={cn(cx('list-item-col'))}>
                        <Zone
                            file={item}
                            {...zoneProps}
                            zone='media-editor-upload-item-thumbnail'
                        />
                    </div>
                    <div className={cn(cx('list-item-col'), 'info')}>
                        <Zone
                            file={item}
                            {...zoneProps}
                            zone='media-editor-upload-item-info'
                        />
                    </div>
                    <div className={cn(cx('list-item-col'), 'action')}>
                        <Zone
                            file={item}
                            {...zoneProps}
                            zone='media-editor-upload-item-action'
                        />
                    </div>
                </div>
            ))}
            {files.map((item, i) => {
                return !item ? null : (
                    <div
                        key={cx(`list-item-file-${i}`)}
                        className={cn(
                            cx('list-item'),
                            getType(op.get(item, '_name', item.name)),
                        )}
                    >
                        <div className={cn(cx('list-item-col'), 'thumb')}>
                            <Zone
                                {...zoneProps}
                                zone='media-editor-file-item-thumbnail'
                                file={{
                                    name: op.get(item, '_name', item.name),
                                    dataURL: item.upload
                                        ? item.upload.dataURL
                                        : op.get(item, '_url', item.url),
                                }}
                            />
                        </div>
                        <div className={cn(cx('list-item-col'), 'info')}>
                            <Zone
                                file={item}
                                {...zoneProps}
                                zone='media-editor-file-item-info'
                            />
                        </div>
                        <div className={cn(cx('list-item-col'), 'action')}>
                            <Zone
                                file={item}
                                {...zoneProps}
                                zone='media-editor-file-item-action'
                            />
                        </div>
                    </div>
                );
            })}
            <Zone {...zoneProps} zone={'media-editor-preview-bottom'} />
            <Zone
                {...zoneProps}
                zone={`media-editor-preview-bottom-${uploader.getAttribute(
                    'fieldName',
                )}`}
            />
        </div>
    );
});

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
