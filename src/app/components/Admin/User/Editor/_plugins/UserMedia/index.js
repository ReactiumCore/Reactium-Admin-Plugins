import _ from 'underscore';
import Empty from './Empty';
import op from 'object-path';
import ENUMS from 'components/Admin/Media/enums';
import React, { useEffect, useRef, useState } from 'react';

import { Dropzone, Spinner } from '@atomic-reactor/reactium-ui';

import Reactium, {
    __,
    useEventHandle,
    useHandle,
    useHookComponent,
    useReduxState,
} from 'reactium-core/sdk';

const noop = () => {};

const UserMedia = ({ editor }) => {
    const title = __('User Media');

    // Redux state
    const [redux, setReduxState] = useReduxState('Media');

    // Refs
    const dropzoneRef = useRef();
    const spinnerRef = useRef();

    // Components
    const SearchBar = useHandle('SearchBar');
    const Helmet = useHookComponent('Helmet');
    const List = useHookComponent('MediaList');
    const Toolbar = useHookComponent('MediaToolbar');
    const Uploads = useHookComponent('MediaUploads');

    // States
    const [data, setNewData] = useState();

    const [directory, setNewDirectory] = useState();

    const [init, setNewInit] = useState(false);

    const [type, setNewType] = useState();

    // Editor
    const { cx, isMounted, setState, state = {}, unMounted } = editor;
    const { value } = state;
    const meta = op.get(value, 'meta', {});

    // Functions
    const browseFiles = () => dropzoneRef.current.browseFiles();

    const dropzoneProps = {
        config: {
            chunking: false,
            clickable: true,
            previewTemplate:
                '<div class="dz-preview dz-file-preview"><span data-dz-name></div>',
        },
        debug: false,
    };

    const isEmpty = () => Object.keys(op.get(meta, 'media', {})).length < 1;

    const search = () => {
        if (init !== true) return noop;

        const d = op.get(meta, 'media', {});
        const dataArray = Object.keys(d).map(key => {
            const item = { ...d[key] };
            op.set(item, 'objectId', key);
            return item;
        });

        const newData = Reactium.Media.filter(
            { directory, search: SearchBar.state.value, type },
            dataArray,
        );

        setData(newData);

        return noop;
    };

    const setData = newData => {
        if (unMounted()) return;
        if (_.isEqual(data, newData)) return;
        _.defer(() => setNewData(newData));
    };

    const setDirectory = newDirectory => {
        if (unMounted()) return;
        setNewDirectory(newDirectory);
    };

    const setInit = newInit => {
        if (!spinnerRef.current) return;
        setNewInit(newInit);
    };

    const setType = newType => {
        if (unMounted()) return;
        setNewType(newType);
    };

    const toggleSearch = () => {
        SearchBar.setState({ visible: !isEmpty() });
    };

    const _onError = evt => {
        setState({
            error: { message: evt.message },
        });
    };

    const _onFileAdded = e => {
        return Reactium.Media.upload(e.added, directory);
    };

    const _onFileRemoved = file => {
        if (dropzoneRef.current) {
            dropzoneRef.current.removeFiles(file);
        }
    };

    const _onMediaChange = () => {
        const library = op.get(redux, 'library');
        const ids = Object.keys(data);
        const add = library.filter(item => {
            const { objectId, user } = item;

            if (ids.includes(objectId)) return false;
            if (user.id !== value.objectId) return false;

            return true;
        });

        if (add.length < 1) return;

        const newValue = { ...value };
        const newMeta = { ...meta };

        add.forEach(item => {
            const { objectId } = item;
            op.set(newMeta, ['media', objectId], item);
        });

        op.set(newValue, 'meta', newMeta);
        setState({ value: newValue });
    };

    const _onMediaDelete = e => {
        if (unMounted()) return;

        const { objectId } = e;
        const newValue = { ...value };
        const newMeta = { ...meta };

        op.del(newMeta, ['media', objectId]);
        op.set(newValue, 'meta', newMeta);
        setState({ value: newValue });
    };

    const _onSearch = () => search();

    // Handle
    const _handle = () => ({
        ENUMS,
        browseFiles,
        cname: Reactium.Utils.cxFactory('admin-media'),
        directory,
        isEmpty,
        isMounted,
        setDirectory,
        setState: setReduxState,
        setType,
        state: redux,
        type,
        unMounted,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    // handle update
    useEffect(() => {
        if (!value) return;
        const newHandle = _handle();
        if (_.isEqual(newHandle, handle)) return;
        setHandle(newHandle);
    }, [value, directory, type]);

    // update data
    useEffect(() => {
        if (!value) return;
        const newData = op.get(meta, 'media', {});
        setData(newData);
    }, [op.get(meta, 'media'), value]);

    // search change
    useEffect(_onSearch, [directory, SearchBar.state.value, type, value]);

    // hide/show search
    useEffect(toggleSearch, [SearchBar, isEmpty(), value]);

    // media hooks
    useEffect(() => {
        const hooks = [];
        hooks.push(Reactium.Hook.register('media-delete', _onMediaDelete));
        hooks.push(Reactium.Hook.register('media-change', _onMediaChange));

        return () => {
            hooks.forEach(Reactium.Hook.unregister);
        };
    });

    // delay before we render the list so that the ui doesn't freeze
    useEffect(() => {
        if (!value) return;
        if (!isEmpty() && data && init !== true) {
            _.delay(() => setInit(true), 250);
        }
        if (isEmpty()) {
            _.delay(() => setInit(true), 250);
        }
    }, [data, value]);

    return (
        <>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            {init ? (
                <Dropzone
                    {...dropzoneProps}
                    className={cx('media')}
                    files={{}}
                    onError={e => _onError(e)}
                    onFileAdded={e => _onFileAdded(e)}
                    ref={dropzoneRef}>
                    <Uploads
                        onRemoveFile={_onFileRemoved}
                        uploads={op.get(redux, 'uploads', {})}
                    />
                    <Toolbar Media={handle} />
                    <List
                        data={data}
                        empty={isEmpty()}
                        emptyComponent={<Empty value={value} />}
                    />
                </Dropzone>
            ) : (
                <div className={cx('media')} ref={spinnerRef}>
                    <Spinner />
                </div>
            )}
        </>
    );
};

export { UserMedia, UserMedia as default };
