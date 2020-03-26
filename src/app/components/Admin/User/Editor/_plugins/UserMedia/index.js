import _ from 'underscore';
import Empty from './Empty';
import op from 'object-path';
import cn from 'classnames';
import ENUMS from 'components/Admin/Media/enums';
import React, { useEffect, useRef, useState } from 'react';

import { Button, Dropzone, Icon, Spinner } from '@atomic-reactor/reactium-ui';

import Reactium, {
    __,
    useEventHandle,
    useHandle,
    useHookComponent,
    useReduxState,
    useWindowSize,
    Zone,
} from 'reactium-core/sdk';

const UserMedia = ({ editor }) => {
    const { breakpoint } = useWindowSize();

    // Redux state
    const [redux, setReduxState] = useReduxState('Media');

    const dropzoneRef = useRef();

    const SearchBar = useHandle('SearchBar');

    const toggleSearch = () => {
        SearchBar.setState({ visible: !isEmpty() });
        return () => {
            SearchBar.setState({ visible: false });
        };
    };

    const Helmet = useHookComponent('Helmet');
    const List = useHookComponent('MediaList');
    const Toolbar = useHookComponent('MediaToolbar');
    const Uploads = useHookComponent('MediaUploads');

    const [directory, setNewDirectory] = useState(op.get(redux, 'directory'));

    const { cx, isNew, isMounted, setState, state = {}, unMounted } = editor;
    const { editing, tab, value = {} } = state;
    const { meta = {} } = value;

    const [data, setNewData] = useState(op.get(meta, 'media', {}));

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

    const emptyClassName = cx('media-empty');

    const folderSelect = dir => {
        setReduxState({ directory: dir });
        setDirectory(dir);
    };

    const isEmpty = () => _.isEmpty(op.get(meta, 'media', {}));

    const isMobile = () => ['xs', 'sm'].includes(breakpoint);

    const isVisible = () => !isNew() && tab === 'media';

    const title = __('User Media');

    const search = () => {
        const d = op.get(meta, 'media', {});
        const dataArray = Object.keys(d).map(key => {
            const item = { ...d[key] };
            op.set(item, 'objectId', key);
            return item;
        });

        const newData = Reactium.Media.filter(
            { directory, search: SearchBar.state.value },
            dataArray,
        );

        setData(newData);

        return () => {};
    };

    const setData = newData => {
        if (unMounted()) return;
        if (_.isEqual(data, newData)) return;
        setNewData(newData);
    };

    const setDirectory = newDirectory => {
        if (unMounted()) return;
        setNewDirectory(newDirectory);
    };

    const _onDirectoryChange = () => search();

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

    const _onMediaChange = e => {
        const library = op.get(redux, 'library');
        const ids = Object.keys(data);
        const lib = _.pluck(library, 'objectId');
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

    const _handle = () => ({
        ENUMS,
        browseFiles,
        cname: Reactium.Utils.cxFactory('admin-media'),
        directory,
        folderSelect,
        isEmpty,
        isMounted,
        setDirectory,
        setState: setReduxState,
        state: redux,
        unMounted,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    // handle update
    useEffect(() => {
        const newHandle = _handle();
        if (_.isEqual(newHandle, handle)) return;
        setHandle(newHandle);
    });

    // update data
    useEffect(() => {
        if (_.isEmpty(value)) return;
        const newData = op.get(meta, 'media', {});
        if (_.isEqual(data, newData)) return;
        setData(newData);
    }, [op.get(meta, 'media')]);

    // directory change
    useEffect(_onDirectoryChange, [directory]);

    // search change
    useEffect(_onSearch, [SearchBar.state.value]);

    // hide/show search
    useEffect(toggleSearch);

    // media hooks
    useEffect(() => {
        const hooks = [];
        hooks.push(Reactium.Hook.register('media-delete', _onMediaDelete));
        hooks.push(Reactium.Hook.register('media-change', _onMediaChange));

        return () => {
            hooks.forEach(Reactium.Hook.unregister);
        };
    });

    const render = () => {
        const mobile = isMobile();

        return _.isEmpty(value) ? (
            <div className={cx('media')}>
                <Spinner />
            </div>
        ) : (
            <>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
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
            </>
        );
    };

    return isVisible() ? render() : null;
};

export { UserMedia, UserMedia as default };
