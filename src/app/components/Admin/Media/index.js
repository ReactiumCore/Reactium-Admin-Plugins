import _ from 'underscore';
import cn from 'classnames';
import Empty from './Empty';
import ENUMS from './enums';
import op from 'object-path';
import domain from './domain';
import Pagination from './Pagination';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';
import { Dropzone, Spinner } from '@atomic-reactor/reactium-ui';

import Reactium, {
    useAsyncEffect,
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
    const containerRef = useRef();
    const dropzoneRef = useRef();

    // Redux state
    const [state, setState] = useReduxState(domain.name);

    // Components
    const SearchBar = useHandle('SearchBar');
    const Helmet = useHookComponent('Helmet');
    const List = useHookComponent('MediaList');
    const Toolbar = useHookComponent('MediaToolbar');
    const Uploads = useHookComponent('MediaUploads');

    // States
    const [data, setNewData] = useState(mapLibraryToList(state.library));

    const [directory, setNewDirectory] = useState();

    const [page, setNewPage] = useState(op.get(props, 'params.page', 1) || 1);

    const [status, setNewStatus] = useState(ENUMS.STATUS.INIT);

    const [type, setNewType] = useState();

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

    const setType = newType => {
        if (unMounted()) return;
        setNewType(newType);
    };

    // Functions
    const browseFiles = () => dropzoneRef.current.browseFiles();

    const cx = Reactium.Utils.cxFactory(namespace);

    const fetch = params => {
        if (status !== ENUMS.STATUS.INIT) return;
        setStatus(ENUMS.STATUS.PENDING);

        return new Promise((resolve, reject) => {
            const delay = _.random(1, 4);

            _.delay(async () => {
                const media = await Reactium.Media.fetch({
                    ...params,
                    page: -1,
                });
                setStatus(ENUMS.STATUS.READY);
                resolve(media);
            }, delay * 250);
        });
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
            search: SearchBar.state.value,
            type,
            limit: 24,
        });
        setData(newData);
        return noop;
    };

    const toggleSearch = () => {
        SearchBar.setState({ visible: !isEmpty() });
    };

    const unMounted = () => !containerRef.current;

    // Side effects
    useEffect(toggleSearch, [SearchBar, isEmpty()]);

    // Search
    useEffect(search, [
        directory,
        SearchBar.state.value,
        state.library,
        type,
        page,
    ]);

    // Fetch
    useEffect(() => {
        fetch();
    }, [status]);

    // Page change
    useEffect(() => {
        if (page && op.get(props, 'params.page') !== page) {
            Reactium.Routing.history.push(`/admin/media/${page}`);
        }
    }, [page]);
    // Handle
    const _handle = () => ({
        ENUMS,
        browseFiles,
        cname: cx,
        directory,
        isEmpty,
        isMounted,
        page,
        setData,
        setDirectory,
        setPage,
        setState,
        setType,
        state,
        type,
        unMounted,
        zone,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useEffect(() => {
        const newHandle = _handle();
        if (_.isEqual(newHandle, handle)) return;
        setHandle(newHandle);
    }, [Object.values(state), directory, type]);

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
                        <Toolbar Media={handle} />
                        <Uploads
                            onRemoveFile={onFileRemoved}
                            uploads={op.get(state, 'uploads', {})}
                        />
                        {!isEmpty() ? <List data={data} /> : <Empty />}
                        {!isEmpty() && <Pagination Media={handle} />}
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
    page: 1,
    title: ENUMS.TEXT.TITLE,
};

export { Media as default };
