import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';
import op from 'object-path';
import domain from './domain';
import { Helmet } from 'react-helmet';

import Reactium, {
    useDocument,
    useHandle,
    useRegisterHandle,
    useSelect,
    useStore,
    useWindowSize,
    useReduxState,
} from 'reactium-core/sdk';

import { Button, Dropzone, Icon } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

// Server-Side Render safe useLayoutEffect (useEffect when node)
const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Media
 * -----------------------------------------------------------------------------
 */
let Media = ({ dropzoneProps, zone, title }, ref) => {
    const iDoc = useDocument();

    const { breakpoint } = useWindowSize();

    const [state, setState] = useReduxState(domain.name);

    const SearchBar = useHandle('SearchBar');

    // Refs
    const containerRef = useRef();
    const dropzoneRef = useRef();

    // Functions
    const cx = cls => _.compact([`zone-${zone}`, cls]).join('-');

    const isEmpty = () => op.get(state, 'library', []).length < 1;

    const isUploading = () =>
        Object.keys(op.get(state, 'files', {})).length > 0;

    const onChange = async evt => {
        const directory = op.get(state, 'directory', '/assets/uploads');
        const { files = {} } = state;

        // remove files if necessary
        const removed = op.get(evt, 'removed') || [];
        removed.forEach(file => {
            delete files[file.ID];
        });

        const added = op.get(evt, 'added') || [];
        added.forEach(file => {
            if (!files[file.ID]) {
                files[file.ID] = file;
                files[file.ID]['directory'] = directory;
            }
        });

        Object.values(evt.files).forEach(file => {
            const action = !file.action ? ENUMS.EVENT.ADDED : file.status;
            files[file.ID]['action'] = files[file.ID].action || action;
        });

        setState({ files });
    };

    const onBrowseClick = () => dropzoneRef.current.browseFiles();

    const onFileError = evt => {
        console.log({ error: evt.message });

        setState({
            error: { message: evt.message },
        });
    };

    const removeFile = file => {
        dropzoneRef.current.removeFiles(file);
        Reactium.Media.removeChunks(file);
    };

    const getFileStatus = file => op.get(file, 'action');

    const Uploads = ({ files }) => {
        files = Object.values(files);

        const getType = file => file.upload.filename.split('.').pop();

        const isImage = file =>
            ['png', 'svg', 'gif', 'jpg', 'jpeg'].includes(getType(file));

        const getIcon = file => {
            const type = getType(file);
            const status = getFileStatus(file);

            return null;
        };

        const getStyle = file =>
            isImage(file) ? { backgroundImage: `url(${file.dataURL})` } : null;

        return files.length < 1 ? null : (
            <ul>
                {files.map((file, i) => {
                    const status = getFileStatus(file);
                    const style = getStyle(file);
                    return (
                        <li
                            key={`media-upload-${i}`}
                            className={cn(status, cx('upload'))}>
                            <div
                                className={cn(status, cx('upload-image'))}
                                children={getIcon(file)}
                                style={getStyle(file)}
                            />
                            <div className={cn(status, cx('upload-name'))}>
                                {op.get(file, 'upload.filename')}
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
                                        onClick={() => removeFile(file)}>
                                        <Icon name='Feather.Check' size={18} />
                                    </Button>
                                )}
                                {status === ENUMS.STATUS.QUEUED && (
                                    <Button
                                        onClick={() => removeFile(file)}
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
                                        <Icon
                                            name='Feather.ArrowUp'
                                            size={18}
                                        />
                                    </Button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    };

    const RenderEmpty = () => (
        <div className='label'>
            <Icon
                name='Linear.CloudUpload'
                size={['xs', 'sm'].includes(breakpoint) ? 96 : 128}
            />
            <div className='my-xs-32 my-md-40'>{ENUMS.TEXT.EMPTY}</div>
            <Button
                size={['xs', 'sm'].includes(breakpoint) ? 'md' : 'lg'}
                color='primary'
                appearance='pill'
                onClick={onBrowseClick}>
                {ENUMS.TEXT.BROWSE}
            </Button>
        </div>
    );

    // Renderer
    const render = () => {
        const empty = isEmpty();
        const { files = {} } = state;

        return (
            <div ref={containerRef}>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <Dropzone
                    {...dropzoneProps}
                    files={files}
                    ref={dropzoneRef}
                    className={cx('dropzone')}
                    onChange={onChange}
                    onError={onFileError}>
                    <div className={cx('uploads')}>{Uploads(state)}</div>
                    <div className={cn(cx('library'), { empty: !!empty })}>
                        {empty && <RenderEmpty />}
                    </div>
                </Dropzone>
            </div>
        );
    };

    useEffect(() => SearchBar.setState({ visible: !isEmpty() }));

    // External Interface
    const handle = () => ({
        ENUMS,
        ref,
        setState,
        state,
    });

    useRegisterHandle('Media', handle, [
        op.get(state, 'files', []).length,
        op.get(state, 'library', []).length,
    ]);

    // Render
    return render();
};

Media = forwardRef(Media);

Media.ENUMS = ENUMS;

Media.defaultProps = {
    dropzoneProps: {
        config: {
            chunking: true,
            chunkSize: ENUMS.MAX_BYTES,
            clickable: true,
            forceChunking: true,
            previewTemplate:
                '<div class="dz-preview dz-file-preview"><span data-dz-name></div>',
        },
        debug: false,
    },
    title: ENUMS.TEXT.TITLE,
};

export { Media as default };
