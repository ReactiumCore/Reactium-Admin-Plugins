import _ from 'underscore';
import cn from 'classnames';
import Empty from './Empty';
import ENUMS from './enums';
import op from 'object-path';
import domain from './domain';
import Uploads from './Uploads';
import { Helmet } from 'react-helmet';
import { completedUploads } from './utils';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';
import { Dropzone, Spinner } from '@atomic-reactor/reactium-ui';

import Reactium, {
    useDocument,
    useHandle,
    useReduxState,
    useRegisterHandle,
    useSelect,
    useStore,
    useWindowSize,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
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
    const animationRef = useRef({});
    const containerRef = useRef();
    const directoryRef = useRef(op.get(state, 'directory', 'uploads'));
    const dropzoneRef = useRef();
    const stateRef = useRef(state);
    const pulseRef = useRef();

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

    const onChange = evt => {
        const directory = directoryRef.current;
        const { files = {}, uploads } = stateRef.current;

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
                files[file.ID]['action'] = ENUMS.EVENT.ADDED;
            }
        });

        Object.values(evt.files).forEach(file => {
            let action = op.get(file, 'action') || ENUMS.EVENT.ADDED;
            const upload = op.get(uploads, file.ID);

            if (upload) {
                action = op.get(upload, 'action', action);
                files[file.ID]['url'] = op.get(upload, 'url');
                files[file.ID]['directory'] = directory;
                uploads[file.ID]['directory'] = directory;
            }

            try {
                files[file.ID]['action'] = action;
            } catch (err) {}
        });

        setState({ files, uploads });
    };

    const collapse = ID => {
        const elm = iDoc.getElementById(`upload-${ID}`);
        if (!elm) return Promise.resolve();

        animationRef.current[ID] = true;

        return new Promise(resolve => {
            elm.style.overflow = 'hidden';
            TweenMax.to(elm, 0.5, {
                height: 0,
                opacity: 0,
                ease: Power2.easeIn,
                onComplete: () => resolve(),
            });
        });
    };

    const onClearUploads = () =>
        completedUploads().forEach(file => {
            const timestamp = moment(new Date(file.statusAt));
            if (moment().diff(timestamp, 'seconds') >= 5) {
                if (animationRef[file.ID]) return;

                collapse(file.ID).then(() => {
                    onRemoveFile(file);
                    delete animationRef.current[file.ID];
                });
            }
        });

    const onDirectoryAddClick = () => {};

    const onFileError = evt => {
        console.log({ error: evt.message });

        setState({
            error: { message: evt.message },
        });
    };

    const onFolderSelect = dir => {
        directoryRef.current = dir;
        setState({ directory: dir });
    };

    const onRemoveFile = file => {
        dropzoneRef.current.removeFiles(file);
        Reactium.Media.removeChunks(file);
    };

    // Side effects
    useEffect(() => SearchBar.setState({ visible: !isEmpty() }));

    useEffect(() => {
        const { page = 1 } = state;
        const search = op.get(SearchBar, 'value');
        Reactium.Media.fetch({ page, search });
    }, [op.get(state, 'page'), op.get(SearchBar, 'value')]);

    useEffect(() => {
        Reactium.Pulse.register('MediaClearInternal', onClearUploads, {
            delay: 1000,
        });
        return () => {
            Reactium.Pulse.unregister('MediaClearInternal');
        };
    }, []);

    useEffect(() => {
        directoryRef.current = op.get(state, 'directory', 'uploads');
    }, [op.get(state, 'directory', 'uploads'), directoryRef.current]);

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
    const render = () => {
        const empty = isEmpty();
        const {
            directories = ['uploads'],
            fetched,
            files = {},
            updated,
        } = state;

        const directory = directoryRef.current;

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
                        onChange={e => onChange(e)}
                        onError={onFileError}>
                        <div className={cx('uploads')}>
                            <Uploads
                                {...state}
                                zone={zone}
                                onRemoveFile={onRemoveFile}
                            />
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
