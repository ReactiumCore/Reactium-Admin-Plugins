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
    useReduxState,
    useRegisterHandle,
} from 'reactium-core/sdk';

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Media
 * -----------------------------------------------------------------------------
 */
let Media = ({ dropzoneProps, namespace, zone, title, ...props }) => {
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
        status: ENUMS.STATUS.INIT,
        type: null,
        updated: null,
    });

    const setState = newState => {
        if (unMounted()) return;
        updateState(newState);
    };

    const setData = (data = []) =>
        setState({ data: mapLibraryToList(data), status: ENUMS.STATUS.READY });

    const setDirectory = directory => setState({ directory });
    const setPage = page => setState({ page });
    const setStatus = status => setState({ status });
    const setType = type => setState({ type });

    // Functions
    const browseFiles = () => dropzoneRef.current.browseFiles();

    const cx = Reactium.Utils.cxFactory(namespace);

    const fetch = params => Reactium.Media.fetch({ ...params, page: -1 });

    const isEmpty = () => op.get(reduxState, 'pagination.empty', true);

    const isMounted = () => !unMounted();

    const onError = ({ message }) => setReduxState({ error: { message } });

    const onFileAdded = e => Reactium.Media.upload(e.added, state.directory);

    const onFileRemoved = file => {
        if (unMounted()) return;
        dropzoneRef.current.removeFiles(file);
        setData(reduxState.library);
        fetch();
    };

    const search = pg => {
        if (state.status !== ENUMS.STATUS.READY) return noop;

        const { directory, page, type } = state;
        const pages = op.get(reduxState, 'pagination.pages', 1);

        pg = pg || page;
        pg = pg > pages ? pages : pg;
        pg = pg < 1 ? 1 : pg;

        const newData = Reactium.Media.filter({
            directory,
            page: pg,
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

    // Handle
    const _handle = () => ({
        ENUMS,
        browseFiles,
        cname: cx,
        directory: state.directory,
        isEmpty,
        isMounted,
        page: state.page,
        setData,
        setDirectory,
        setPage,
        setState,
        setType,
        state,
        type: state.type,
        unMounted,
        zone: Array.isArray(zone) ? zone[0] : zone,
    });

    const [handle] = useEventHandle(_handle());

    // Side effects

    useEffect(toggleSearch, [SearchBar, isEmpty()]);

    // Search
    useEffect(search, [
        SearchBar.state.value,
        state.directory,
        state.library,
        state.type,
        state.page,
        op.get(reduxState, 'pagination.pages'),
    ]);

    // Fetch
    useAsyncEffect(async () => {
        if (state.status === ENUMS.STATUS.INIT) {
            setStatus(ENUMS.STATUS.PENDING);
            const data = await fetch();
            setData(data);
            setStatus(ENUMS.STATUS.READY);
        }
    }, [state.status]);

    // Page change
    useEffect(() => {
        const { page = 1 } = state;
        const pg = op.get(reduxState, 'page');

        if (pg !== page) {
            Reactium.Routing.history.push(`/admin/media/${page}`);
        }
    }, [state.page]);

    useRegisterHandle(domain.name, () => handle, [handle]);

    console.log(state);

    // Render
    return (
        <div ref={containerRef}>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            {op.get(state, 'status') === ENUMS.STATUS.READY ? (
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
                        uploads={op.get(reduxState, 'uploads', {})}
                    />
                    {!isEmpty() ? (
                        <List data={state.data} />
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

const mapLibraryToList = library => _.indexBy(library, 'objectId');

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
