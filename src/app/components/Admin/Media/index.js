import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';
import op from 'object-path';
import domain from './domain';
import { Helmet } from 'react-helmet';
import { completedUploads } from './utils';
import bytesConvert from './utils/bytesConvert';
import Empty from './Empty';
import onChange from './utils/onFileChange';

import Reactium, {
    useDocument,
    useHandle,
    useRegisterHandle,
    useSelect,
    useStore,
    useWindowSize,
    useReduxState,
} from 'reactium-core/sdk';

import {
    Button,
    Dropdown,
    Dropzone,
    Icon,
    Progress,
    Spinner,
} from '@atomic-reactor/reactium-ui';

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

    const directory = op.get(state, 'directory', 'uploads');

    // Refs
    const containerRef = useRef();
    const dropzoneRef = useRef();

    // Functions
    const cx = cls => _.compact([`zone-${zone}`, cls]).join('-');

    const isEmpty = () => {
        const { library = {} } = state;
        const values = _.chain(Object.values(library))
            .flatten()
            .compact()
            .value();
        return values.length < 1;
    };

    const isUploading = () =>
        Object.keys(op.get(state, 'files', {})).length > 0;

    const onBrowseClick = () => dropzoneRef.current.browseFiles();

    const onFileError = evt => {
        console.log({ error: evt.message });

        setState({
            error: { message: evt.message },
        });
    };

    const onFolderSelect = dir => setState({ directory: dir });

    const onDirectoryAddClick = () => {};

    const removeFile = file => {
        dropzoneRef.current.removeFiles(file);
        Reactium.Media.removeChunks(file);
    };

    const getFileStatus = file => op.get(file, 'action');

    const Uploads = ({ files, uploads }) => {
        files = Object.values(files);

        const getType = filename => {
            return String(filename)
                .split('.')
                .pop();
        };

        const isImage = filename =>
            ['png', 'svg', 'gif', 'jpg', 'jpeg'].includes(getType(filename));

        const getIcon = (file, status) => {
            const type = getType(file.filename);
            return null;
        };

        const getStyle = (file, filename) =>
            isImage(filename)
                ? { backgroundImage: `url(${file.dataURL})` }
                : null;

        return files.length < 1 ? null : (
            <ul>
                {files.map((file, i) => {
                    const upload = op.get(uploads, file.ID, {});
                    const filename = op.get(file, 'upload.filename');
                    const style = getStyle(file, filename);
                    const status = op.get(file, 'action');
                    const progress = op.get(upload, 'progress', 0);
                    const size = op.get(file, 'upload.total', 0);
                    const url = op.get(file, 'url', '...');
                    return (
                        <li
                            key={`media-upload-${i}`}
                            className={cn(status, cx('upload'))}>
                            <div
                                className={cn(status, cx('upload-image'))}
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

    // Renderer
    const render = () => {
        const empty = isEmpty();
        const {
            directories = ['uploads'],
            fetched,
            files = {},
            updated,
        } = state;

        return (
            <div ref={containerRef}>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                {fetched && (
                    <Dropzone
                        {...dropzoneProps}
                        ref={dropzoneRef}
                        files={files}
                        className={cx('dropzone')}
                        onChange={onChange}
                        onError={onFileError}>
                        <div className={cx('uploads')}>
                            <Uploads {...state} />
                        </div>
                        <div className={cn(cx('library'), { empty: !!empty })}>
                            {empty && (
                                <Empty
                                    breakpoint={breakpoint}
                                    directory={directory}
                                    directories={directories}
                                    onBrowseClick={onBrowseClick}
                                    onChange={onFolderSelect}
                                    onDirectoryAddClick={onDirectoryAddClick}
                                    zone={zone}
                                />
                            )}
                            {!empty && <div>FILES</div>}
                        </div>
                    </Dropzone>
                )}
                {!fetched && (
                    <div className={cx('spinner')}>
                        <Spinner />
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => SearchBar.setState({ visible: !isEmpty() }));

    useEffect(() => {
        const { page = 1 } = state;
        const search = op.get(SearchBar, 'value');
        Reactium.Media.fetch({ page, search });
    }, [op.get(state, 'page'), op.get(SearchBar, 'value')]);

    useEffect(() => {
        if (!dropzoneRef.current) return;
        const completed = completedUploads();
        completed.forEach(removeFile);
    }, [dropzoneRef.current]);

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

/*
WEIRD SHIT… I pass an onChange function to <Dropzone /> component. It uses it as is from the props .
Inside my component that uses the dropzone, I have a function onChange I’m using a state value: directory and when I change that value via useReduxStore.setState() it updates the state. But when the onChange function is run, it doesn’t have the update value of directory from the state until after the onChange  is complete.
*/
