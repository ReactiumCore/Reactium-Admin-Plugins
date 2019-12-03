import _ from 'underscore';
import cn from 'classnames';
import Empty from './Empty';
import ENUMS from './enums';
import op from 'object-path';
import domain from './domain';
import Uploads from './Uploads';
import { Helmet } from 'react-helmet';
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

    const onBrowseClick = () => dropzoneRef.current.browseFiles();

    const onClearUploads = () =>
        completedUploads().forEach(file => {
            const timestamp = moment(new Date(file.statusAt));
            if (moment().diff(timestamp, 'seconds') >= 5) {
                if (animationRef[file.ID]) return;

                collapse(file.ID).then(() => {
                    onFileRemoved(file);
                    delete animationRef.current[file.ID];
                });
            }
        });

    const onDirectoryAddClick = () => {};

    const onError = evt => {
        console.log({ error: evt.message });

        setState({
            error: { message: evt.message },
        });
    };

    const onFileAdded = e =>
        Reactium.Media.upload(e.added, directoryRef.current);

    const onFileRemoved = file => {
        dropzoneRef.current.removeFiles(file);
        Reactium.Media.cancel(file);
    };

    const onFolderSelect = dir => {
        directoryRef.current = dir;
        setState({ directory: dir });
    };

    // Side effects
    useEffect(() => SearchBar.setState({ visible: !isEmpty() }));

    useEffect(() => {
        const { page = 1 } = state;
        const search = op.get(SearchBar, 'value');
        Reactium.Media.fetch({ page, search });
    }, [op.get(state, 'page'), op.get(SearchBar, 'value')]);

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
                        className={cx('dropzone')}
                        files={{}}
                        onError={onError}
                        onFileAdded={e => onFileAdded(e)}
                        ref={dropzoneRef}>
                        <div className={cx('uploads')}>
                            <Uploads
                                {...state}
                                zone={zone}
                                onRemoveFile={onFileRemoved}
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
            chunking: false,
            clickable: true,
            previewTemplate:
                '<div class="dz-preview dz-file-preview"><span data-dz-name></div>',
        },
        debug: false,
    },
    title: ENUMS.TEXT.TITLE,
};

export { Media as default };
