import _ from 'underscore';
import cn from 'classnames';
import Empty from './Empty';
import ENUMS from './enums';
import op from 'object-path';
import domain from './domain';
import Toolbar from './Toolbar';
import List from './List';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';
import { Dropzone, Spinner } from '@atomic-reactor/reactium-ui';

import Reactium, {
    useEventHandle,
    useHandle,
    useHookComponent,
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
let Media = ({ dropzoneProps, namespace, zone, title, ...props }, ref) => {
    // Refs
    const animationRef = useRef({});
    const containerRef = useRef();
    const dropzoneRef = useRef();

    // External Components
    const Helmet = useHookComponent('Helmet');

    const Uploads = useHookComponent('MediaUploads');

    // Search
    const SearchBar = useHandle('SearchBar');
    const search = useSelect(state => op.get(state, 'SearchBar.value'));

    // States
    const [directory, setNewDirectory] = useState(op.get(state, 'directory'));

    const [page, setNewPage] = useState(op.get(props, 'params.page', 1));

    const [state, setState] = useReduxState(domain.name);

    const [status, setNewStatus] = useState(ENUMS.STATUS.INIT);

    const setDirectory = newDirectory => {
        if (unMounted()) return;
        setNewDirectory(newDirectory);
    };

    const setPage = newPage => {
        if (unMounted()) return;
        setNewPage(newPage);
    };

    const setStatus = newStatus => {
        if (unMounted()) return;
        setNewStatus(newStatus);
    };

    // Functions
    const browseFiles = () => dropzoneRef.current.browseFiles();

    const cx = Reactium.Utils.cxFactory(namespace);

    const folderSelect = dir => {
        setState({ directory: dir });
        setDirectory(dir);
    };

    const getData = async params => {
        setStatus(ENUMS.STATUS.PENDING);
        await Reactium.Media.fetch(params);
        _.defer(() => setStatus(ENUMS.STATUS.READY));
    };

    const isEmpty = () => op.get(state, 'pagination.empty', true);

    const isMounted = () => !unMounted();

    const isUploading = () =>
        Object.keys(op.get(state, 'files', {})).length > 0;

    const onError = evt => {
        setState({
            error: { message: evt.message },
        });
    };

    const onFileAdded = e => {
        return Reactium.Media.upload(e.added, directory);
    };

    const onFileRemoved = file => {
        if (dropzoneRef.current) {
            dropzoneRef.current.removeFiles(file);
        }
    };

    const unMounted = () => !containerRef.current;

    // Side effects
    useEffect(() => {
        SearchBar.setState({ visible: !isEmpty() });
    });

    // Search
    useEffect(() => {
        getData({ directory, page, search });
    }, [directory, page, search]);

    // Fetch
    useEffect(() => {
        if (status !== ENUMS.STATUS.INIT || status === ENUMS.STATUS.READY) {
            return;
        }

        getData();
    }, [status]);

    // Handle
    const _handle = () => ({
        ENUMS,
        browseFiles,
        cname: cx,
        directory,
        folderSelect,
        isEmpty,
        isMounted,
        setDirectory,
        setState,
        state,
        unMounted,
        zone,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useEffect(() => {
        const newHandle = _handle();
        if (_.isEqual(newHandle, handle)) return;
        setHandle(newHandle);
    }, [Object.values(state)]);

    useRegisterHandle(domain.name, () => handle, [
        op.get(state, 'updated'),
        isEmpty(),
    ]);

    // Render
    const render = () => {
        return (
            <div ref={containerRef}>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                {op.get(state, 'fetched') ? (
                    <Dropzone
                        {...dropzoneProps}
                        className={cx('dropzone')}
                        files={{}}
                        onError={onError}
                        onFileAdded={e => onFileAdded(e)}
                        ref={dropzoneRef}>
                        <Toolbar Media={_handle()} />
                        <Uploads
                            onRemoveFile={onFileRemoved}
                            uploads={op.get(state, 'uploads', {})}
                        />
                        {!isEmpty() ? (
                            <List data={mapLibraryToList(state.library)} />
                        ) : (
                            <Empty />
                        )}
                    </Dropzone>
                ) : (
                    <div className={cx('spinner')}>
                        <Spinner />
                    </div>
                )}
            </div>
        );
    };

    return render();
};

const mapLibraryToList = library => _.indexBy(library, 'objectId');

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
    namespace: 'admin-media',
    title: ENUMS.TEXT.TITLE,
};

export { Media as default };
