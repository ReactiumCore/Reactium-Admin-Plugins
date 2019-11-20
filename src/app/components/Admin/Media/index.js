import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';
import op from 'object-path';
import domain from './domain';

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
let Media = ({ dropzoneProps, zone }, ref) => {
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

    const onBrowseClick = () => dropzoneRef.current.browseFiles();

    const onFileError = evt => {
        console.log({ error: evt.message });

        setState({
            updated: Date.now(),
            error: { message: evt.message },
        });
    };

    const onChange = evt => setState({ files: evt.files, updated: Date.now() });

    const removeFile = file => dropzoneRef.current.removeFiles(file);

    const Uploads = ({ files }) => {
        files = Object.values(files);

        const getType = file => file.type.split('/').pop();

        const isImage = file =>
            ['png', 'svg', 'gif', 'jpg', 'jpeg'].includes(getType(file));

        const getIcon = file => {
            const type = getType(file);
            const { status } = file;

            return null;
        };

        const getStyle = file =>
            isImage(file) ? { backgroundImage: `url(${file.dataURL})` } : null;

        return files.length < 1 ? null : (
            <ul>
                {files.map((file, i) => {
                    const { status } = file;
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
                                {file.name}
                            </div>
                            <div className={cn(status, cx('upload-status'))}>
                                {status}
                            </div>
                            <div className={cn(status, cx('upload-action'))}>
                                {status === 'queued' && (
                                    <Button
                                        onClick={() => removeFile(file)}
                                        size='xs'
                                        color='danger'
                                        appearance='circle'>
                                        <Icon name='Feather.X' size={18} />
                                    </Button>
                                )}
                                {status === 'complete' && (
                                    <Button
                                        size='xs'
                                        color='primary'
                                        appearance='circle'>
                                        <Icon name='Feather.Check' size={18} />
                                    </Button>
                                )}
                                {status === 'uploading' && (
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
                <Dropzone
                    {...dropzoneProps}
                    files={files}
                    ref={dropzoneRef}
                    className={cx('dropzone')}
                    onChange={onChange}
                    onError={onFileError}>
                    <div className={cx('uploads')}>
                        <Uploads {...state} />
                    </div>
                    <div className={cn(cx('library'), { empty: !!empty })}>
                        {empty && <RenderEmpty />}
                    </div>
                </Dropzone>
            </div>
        );
    };

    useEffect(() => SearchBar.setState({ visible: !isEmpty() }));

    useEffect(() => {
        Reactium.Pulse.register(
            'MediaUploadQueue',
            Media.upload,
            {
                attempts: 5,
                delay: 1000,
                repeat: 5,
            },
            1,
            2,
            3,
        );

        // return () => Reactium.Pulse.unregister('MediaUploadQueue');
    }, [Reactium.Pulse]);

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

Media.upload = (task, ...params) =>
    new Promise((resolve, reject) => {
        if (1 === 1) {
            // Forcing an error to test the retry api
            console.log(
                'Media.upload attempt:',
                `${task.attempt}/${task.attempts}`,
            );

            if (task.failed) {
                console.log('Media.upload FAILED');
            }

            return reject('no go bro');
        }

        if (task.complete) {
            console.log('Media.upload COMPLETE');
        }

        resolve('Media.upload');
    });

// Media.upload = task => {
//     // Forcing an error to test the retry api
//     if (1 !== 2) {
//         if (task.attempts > 0) {
//             console.log(
//                 'Media.upload attempt:',
//                 `${task.attempt}/${task.attempts}`,
//             );
//         }
//
//         if (task.failed) {
//             console.log('Media.upload MAX ATTEMPTS');
//         }
//
//         return new Error('no go bro');
//     }
//
//     if (task.complete) {
//         console.log('Media.upload COMPLETE');
//     }
//
//     return 'Media.upload';
// };

Media.ENUMS = ENUMS;

Media.defaultProps = {
    dropzoneProps: {
        config: {
            clickable: true,
            previewTemplate:
                '<div class="dz-preview dz-file-preview"><span data-dz-name></div>',
        },
        debug: false,
    },
};

export { Media as default };
