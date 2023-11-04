import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { fileExtensions } from '../fileExtensions';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';

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

    const onDragEnd = (e) => {
        if (!e) return;
        if (!e.source) return;
        if (!e.destination) return;

        const from = e.source.index;
        const to = e.destination.index;

        uploader.move({ from, to });
    };

    state.extend('uploading', upload);

    uploader.extend('getType', getType);

    uploader.extend('uploading', uploading);

    useImperativeHandle(ref, () => state);

    const FileListItem = ({ item, provided }) => {
        const p = provided
            ? {
                  ...provided.draggableProps,
                  ...provided.dragHandleProps,
              }
            : {};

        return !item ? null : (
            <li
                {...p}
                ref={provided ? provided.innerRef : null}
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
                    {provided && <div className='drag-handle' />}
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
            </li>
        );
    };

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

            {files.length > 1 ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={cx('droppable')}>
                        {(provided) => (
                            <ul
                                tabIndex={-1}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {files.map((item, index) => (
                                    <Draggable
                                        index={index}
                                        tabIndex={-1}
                                        key={`file-${index}`}
                                        draggableId={`file-${index}`}
                                    >
                                        {(provided, snapshot) => (
                                            <FileListItem
                                                item={item}
                                                provided={provided}
                                                snapshot={snapshot}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
            ) : (
                <ul>
                    {files.map((item, index) => (
                        <FileListItem item={item} key={`file-${index}`} />
                    ))}
                </ul>
            )}

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

export default UploaderPreview;
