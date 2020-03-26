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

import React, { forwardRef, useEffect, useRef, useState } from 'react';

const noop = () => {};
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

    // Redux state
    const [state, setState] = useReduxState(domain.name);

    // External Components
    const Helmet = useHookComponent('Helmet');

    const Uploads = useHookComponent('MediaUploads');

    // Search
    const SearchBar = useHandle('SearchBar');
    const searchText = useSelect(state => op.get(state, 'SearchBar.value'));
    const toggleSearch = () => {
        SearchBar.setState({ visible: !isEmpty() });
        return () => {
            SearchBar.setState({ visible: false });
        };
    };

    // States
    const [data, setNewData] = useState(mapLibraryToList(state.library));

    const [directory, setNewDirectory] = useState(op.get(state, 'directory'));

    const [page, setNewPage] = useState(op.get(props, 'params.page', 1));

    const [status, setNewStatus] = useState(ENUMS.STATUS.INIT);

    const setData = newData => {
        if (unMounted()) return;
        if (_.isEqual(newData, data)) return;
        setNewData(newData);
    };

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

    const fetch = async params => {
        if (status !== ENUMS.STATUS.INIT) return noop;
        setStatus(ENUMS.STATUS.PENDING);
        await Reactium.Media.fetch({ ...params, page: -1 });
        setStatus(ENUMS.STATUS.READY);
        return noop;
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

    const search = () => {
        const newData = Reactium.Media.filter({
            directory,
            page,
            search: searchText,
        });
        setData(newData);
        return noop;
    };

    const unMounted = () => !containerRef.current;

    // Side effects
    useEffect(toggleSearch);

    // Search
    useEffect(search, [directory, searchText, state.library]);

    // Fetch
    useEffect(() => {
        fetch();
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
        setData,
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
                        {!isEmpty() ? <List data={data} /> : <Empty />}
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
