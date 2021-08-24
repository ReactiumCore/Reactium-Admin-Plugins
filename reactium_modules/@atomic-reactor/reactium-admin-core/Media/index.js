import _ from 'underscore';
import Empty from './Empty';
import ENUMS from './enums';
import op from 'object-path';
import domain from './domain';
import Pagination from './Pagination';
import React, { useEffect, useRef } from 'react';
import { Dropzone, Spinner } from '@atomic-reactor/reactium-ui';

import Reactium, {
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
    useRegisterHandle,
    useStatus,
} from 'reactium-core/sdk';

import { useStore, useReduxState } from '@atomic-reactor/use-select';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Media
 * -----------------------------------------------------------------------------
 */
let Media = ({ dropzoneProps, namespace, zone, title, ...props }) => {
    // Store
    const store = useStore();

    // Refs
    const containerRef = useRef();
    const dropzoneRef = useRef();

    // Components
    const SearchBar = useHandle('SearchBar');
    const Helmet = useHookComponent('Helmet');
    const List = useHookComponent('MediaList');
    const Toolbar = useHookComponent('MediaToolbar');
    const Uploads = useHookComponent('MediaUploads');

    // Redux state
    const [reduxState, setReduxState] = useReduxState(domain.name);

    // Internal state
    const [state, updateState] = useDerivedState({
        data: mapLibraryToList(reduxState.library),
        directory: null,
        page: props.page || 1,
        search: null,
        type: null,
        updated: null,
    });

    const setState = newState => {
        if (unMounted()) return;
        updateState(newState);
    };

    const setData = (data = []) => {
        setStatus(ENUMS.STATUS.READY);
        setState({ data: mapLibraryToList(data) });
    };

    const setDirectory = directory => setState({ directory });
    const setPage = page => setState({ page });
    const setType = type => setState({ type });

    // Status
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.INIT);

    // Functions
    const browseFiles = () => dropzoneRef.current.browseFiles();

    const cx = Reactium.Utils.cxFactory(namespace);

    const fetch = params => Reactium.Media.fetch({ ...params, page: -1 });

    const isEmpty = () => {
        if (isStatus(ENUMS.STATUS.READY)) {
            return Object.values(op.get(state, 'data', {})).length < 1;
        } else {
            return op.get(reduxState, 'pagination.empty', true);
        }
    };

    const isMounted = () => !unMounted();

    const onError = ({ message }) => setReduxState({ error: { message } });

    const onFileAdded = e => Reactium.Media.upload(e.added, state.directory);

    const onFileRemoved = file => {
        if (unMounted()) return;
        dropzoneRef.current.removeFiles(file);
        fetch();
    };

    const search = () => {
        const { data, directory, type } = state;

        const { search } = state;

        return Reactium.Media.filter(
            {
                directory,
                search,
                type,
                limit: 24,
            },
            Object.values(data),
        );
    };

    const toggleSearch = () => {
        SearchBar.setState({ visible: !isEmpty() });
    };

    const unMounted = () => !containerRef.current;

    // Handle
    const _handle = () => ({
        ENUMS,
        browseFiles,
        cname: cx,
        directory: state.directory,
        isEmpty,
        isMounted,
        isStatus,
        page: state.page,
        setData,
        setDirectory,
        setPage,
        setState,
        setStatus,
        setType,
        state,
        status,
        type: state.type,
        unMounted,
        zone: Array.isArray(zone) ? zone[0] : zone,
    });

    const [handle, updateHandle] = useEventHandle(_handle());
    const setHandle = newHandle => {
        if (unMounted()) return;

        if (_.isObject(newHandle)) {
            Object.entries(newHandle).forEach(([key, value]) =>
                op.set(handle, key, value),
            );
        }

        updateHandle(handle);
    };

    // Side effects

    // Fetch
    useAsyncEffect(async () => {
        if (isStatus(ENUMS.STATUS.INIT)) {
            setStatus(ENUMS.STATUS.PENDING);
            await fetch();
            setStatus(ENUMS.STATUS.READY, true);
        }
    }, [status]);

    // Update handle
    useEffect(() => {
        const watchKeys = ['directory', 'page', 'type'];

        const changes = watchKeys.reduce((obj, key) => {
            const hnd = op.get(handle, key);
            const val = op.get(state, key);
            if (hnd !== val) obj[key] = val;
            return obj;
        }, {});

        if (Object.keys(changes).length > 0) setHandle(changes);
    });

    // Search
    useEffect(toggleSearch, [SearchBar, isEmpty()]);
    useEffect(() => {
        const search = SearchBar.state.value;
        if (state.search !== search) {
            setState({ search });
        }
    }, [SearchBar.state.value]);

    // Page change
    useEffect(() => {
        const { page = 1 } = state;
        const pg = op.get(reduxState, 'page');

        if (pg !== page) {
            Reactium.Routing.history.push(`/admin/media/${page}`);
        }
    }, [state.page]);

    // Watch for library updates
    useEffect(() => {
        const unsub = store.subscribe(() => {
            const data = op.get(store.getState(), 'Media.library');
            if (!data) return;

            const currentData = Object.values(state.data);
            const equal = _.isEqual(
                _.pluck(data, 'objectId').sort(),
                _.pluck(currentData, 'objectId').sort(),
            );

            if (!equal) setData(data);
        });

        return unsub;
    }, []);

    useRegisterHandle(domain.name, () => handle, [handle]);

    // Render
    return (
        <div ref={containerRef}>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            {isStatus([ENUMS.STATUS.READY]) ? (
                <Dropzone
                    {...dropzoneProps}
                    className={cx('dropzone')}
                    files={{}}
                    onError={onError}
                    onFileAdded={e => onFileAdded(e)}
                    ref={dropzoneRef}>
                    <Uploads
                        onRemoveFile={onFileRemoved}
                        uploads={op.get(reduxState, 'uploads', {})}
                    />
                    {!isEmpty() ? (
                        <>
                            <Toolbar Media={handle} />
                            <List data={search()} />
                        </>
                    ) : (
                        <Empty Media={handle} />
                    )}
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

const mapLibraryToList = library => {
    if (Array.isArray(library)) return _.indexBy(library, 'objectId');
    return library;
};

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
