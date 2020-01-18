import _ from 'underscore';
import cn from 'classnames';
import Image from './Image';
import Video from './Video';
import op from 'object-path';
import PropTypes from 'prop-types';
import ENUMS from 'components/Admin/Media/enums';
import { Scrollbars } from 'react-custom-scrollbars';
import useData from 'components/Admin/Media/_utils/useData';

import Reactium, {
    __,
    useDerivedState,
    useHandle,
    useHookComponent,
    useRegisterHandle,
    useStore,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import {
    Button,
    Dialog,
    Dropdown,
    Dropzone,
    Icon,
    Spinner,
} from '@atomic-reactor/reactium-ui';

const noop = () => {};

const fetchMedia = () =>
    Reactium.Media.fetch({ page: -1 }).then(results => ({
        data: results.files,
        directories: results.directories,
        error: null,
        fetched: true,
        status: ENUMS.STATUS.READY,
        update: Date.now(),
    }));

/**
 * -----------------------------------------------------------------------------
 * MediaPicker
 * -----------------------------------------------------------------------------
 */
class MediaPicker extends EventTarget {
    constructor(handle) {
        super();
        Object.entries(handle).forEach(([key, value]) => (this[key] = value));
    }
}

const MediaPickerComponent = forwardRef(
    (
        {
            ID,
            dropzoneProps,
            header,
            onCancel,
            onChange,
            onDismiss,
            onError,
            onItemSelect,
            onItemUnselect,
            onShow,
            pref,
            style,
            ...props
        },
        ref,
    ) => {
        const Uploads = useHookComponent('MediaUploads');

        const target = new EventTarget();

        const store = useStore();

        const dialogRef = useRef();
        const dropzoneRef = useRef();

        const internals = ['filter', 'search', 'selection'];
        const stateFromProps = Object.keys(props)
            .filter(key => !internals.includes(key))
            .reduce((obj, key) => {
                obj[key] = op.get(props, key);
                return obj;
            }, {});

        const [media, setMedia] = useData(fetchMedia);

        const [filter, setFilter] = useState(op.get(props, 'filter'));
        const [search, setSearch] = useState(op.get(props, 'search', ''));
        const [selection, setSelection] = useState(op.get(props, 'selection'));
        const [state, setState] = useDerivedState({
            className: op.get(props, 'className'),
            data: {},
            directories: [],
            directory: null,
            error: null,
            fetched: false,
            filtered: null,
            status: ENUMS.STATUS.INIT,
            uploads: [],
            visible: false,
            ...stateFromProps,
        });

        const cname = () => {
            const { className, namespace } = state;
            return cn({ [className]: !!className, [namespace]: !!namespace });
        };

        const cx = cls =>
            _.compact([op.get(state, 'namespace'), cls]).join('-');

        const _filter = data => {
            let { directory, searchFields } = state;
            const dataArray = Object.values(data);

            let filtered;

            if (typeof filter === 'function') {
                filtered = dataArray.filter((item, i) =>
                    filter(item, search, i),
                );
            } else {
                const match = search && String(search).toLowerCase();
                const filters = _.flatten([filter]).map(f =>
                    String(f).toUpperCase(),
                );
                filtered = dataArray.filter(item => {
                    let { directory: dir, type } = item;

                    // search
                    if (match && match.length > 2 && searchFields.length > 0) {
                        const score = searchFields.reduce((s, field) => {
                            let val = op.get(item, field, '');
                            val = Array.isArray(val) ? val.join(', ') : val;
                            val = String(val).toLowerCase();

                            s += val.includes(match) ? 1 : 0;

                            return s;
                        }, 0);

                        if (score === 0) return false;
                    }

                    if (
                        directory &&
                        String(dir).toLowerCase() !==
                            String(directory).toLowerCase()
                    ) {
                        return false;
                    }

                    // type filter
                    type = String(type).toUpperCase();
                    if (!filters.includes(type)) return false;

                    return true;
                });
            }

            return _.indexBy(filtered, 'objectId');
        };

        const _onCancel = () => {
            onCancel(PICKER);
            PICKER.dispatchEvent(new CustomEvent('cancel'));
            _onDismiss();
        };

        const _onChange = () => {
            const { minSelect } = state;

            if (minSelect && minSelect > 0 && selection.length < minSelect)
                return _onError({
                    message: ENUMS.TEXT.ERROR.MIN,
                });

            if (selection.length > 0) {
                // handle onChange from props
                onChange(PICKER);

                // dispatch change event
                setTimeout(
                    () => PICKER.dispatchEvent(new CustomEvent('change')),
                    400,
                );

                _onDismiss();
            }
        };

        const _onComplete = async () => {
            let { data, uploads = [] } = state;
            const library = op.get(store.getState(), 'Media.library');

            let selected;
            const completed = library.reduce((count, item) => {
                const { uuid, objectId } = item;
                if (uploads.includes(uuid)) {
                    data[objectId] = item;
                    count += 1;
                    uploads = _.without(uploads, uuid);
                    selected = objectId;
                }
                return count;
            }, 0);

            if (completed > 0) {
                media['data'] = data;
                setState({ data, update: Date.now(), uploads });
                setMedia(media);
                _onItemSelect(selected);
            }
        };

        const _onDirectoryChange = directory => setState({ directory });

        const _onDismiss = () => {
            // handle onDismiss from props
            onDismiss(PICKER);

            // dispatch change event
            setTimeout(
                () => PICKER.dispatchEvent(new CustomEvent('dismiss')),
                250,
            );
        };

        const _onError = e => {
            onError({ target: PICKER, ...e });
            PICKER.dispatchEvent(new CustomEvent('error', { ...e }));
        };

        const _onFileAdded = e => {
            const directory = op.get(state, 'directory') || 'uploads';
            const uploads = op.get(state, 'uploads', []);

            e.added.forEach(file => uploads.push(file.ID));

            setState({ update: Date.now, uploads: _.uniq(uploads) });
            dropzoneRef.current.dropzone.removeAllFiles();
            return Reactium.Media.upload([e.added[0]], directory);
        };

        const _onFileRemoved = file => {};

        const _onItemSelect = objectId => {
            const { maxSelect } = state;
            const multiSelect = maxSelect !== 1;

            const sel = multiSelect ? Array.from(selection) : [];

            if (multiSelect && maxSelect > 0 && sel.length >= maxSelect)
                return _onError({
                    message: ENUMS.TEXT.ERROR.MAX,
                });

            sel.push(objectId);
            setSelection(_.uniq(sel));

            onItemSelect(PICKER);
            PICKER.dispatchEvent(new CustomEvent('itemselect'));
        };

        const _onItemUnselect = objectId => {
            const { minSelect } = state;
            if (minSelect === 1) return;

            const sel = _.without(Array.from(selection), objectId);
            setSelection(_.uniq(sel));

            onItemUnselect(PICKER);
            PICKER.dispatchEvent(new CustomEvent('itemunselect'));
        };

        const _onShow = () => {
            const { visible } = state;
            if (visible === true) return;
            setState({ visible: true });
            onShow(PICKER);
            PICKER.dispatchEvent(new CustomEvent('show'));
        };

        const _header = () => {
            if (header) return header;
            const { title } = state;
            return { title };
        };

        const getDirectories = () => {
            const { directories = [] } = state;
            const dirs = [
                {
                    value: null,
                    label: ENUMS.TEXT.FOLDER_ALL,
                },
            ];

            directories.forEach(item => {
                dirs.push({ value: item, label: item });
            });

            return dirs;
        };

        const getSelection = () => {
            const { data } = state;
            return Object.keys(data).length < 1
                ? {}
                : selection.reduce((sel, id) => {
                      sel[id] = op.get(data, id);
                      return sel;
                  }, {});
        };

        const handle = () => ({
            dialog: dialogRef.current,
            dropzone: dropzoneRef.current,
            filter,
            media,
            props,
            search,
            selection,
            setFilter,
            setMedia,
            setSearch,
            setSelection,
            setState,
            state,
            value: getSelection(),
        });

        const handleDeps = [
            ID,
            dialogRef.current,
            dropzoneRef.current,
            filter,
            media,
            props,
            search,
            selection,
            op.get(state, 'data'),
            op.get(state, 'title'),
        ];

        const PICKER = new MediaPicker(handle());

        useImperativeHandle(ref, () => PICKER, handleDeps);

        useRegisterHandle(ID, () => PICKER, handleDeps);

        // Trigger onShow()
        useEffect(() => {
            _onShow();
        }, [op.get(state, 'visible')]);

        // Fetch
        useEffect(() => {
            if (media) {
                setState(media);
            }
        }, [media, op.get(state, 'update')]);

        // Watch for upload completions
        useEffect(() => {
            Reactium.Pulse.register('MediaUploadComplete', () => _onComplete());
            return () => {
                Reactium.Pulse.unregister('MediaUploadComplete');
            };
        });

        const renderActions = () => {
            const { confirm, directory } = state;
            const dirs = getDirectories();
            return [
                <div className={cx('actions')} key={cx('actions')}>
                    <Dropdown
                        className={cx('directory-select')}
                        data={dirs}
                        onItemClick={e => _onDirectoryChange(e.item.value)}
                        selection={[directory]}>
                        <Button
                            className={cx('directory')}
                            color='tertiary'
                            size='xs'
                            data-dropdown-element>
                            <div className={cx('directory-label')}>
                                {directory || ENUMS.TEXT.FOLDER_ALL}
                            </div>
                            <Icon
                                name='Feather.ChevronDown'
                                size={18}
                                className='chevron'
                            />
                            <Icon
                                name='Feather.Folder'
                                size={18}
                                className='folder'
                            />
                        </Button>
                    </Dropdown>
                </div>,
                selection.length > 0 && confirm && (
                    <div className={cx('confirm')} key={cx('confirm')}>
                        <Button size='sm' color='danger' onClick={_onCancel}>
                            {__('Cancel')}
                        </Button>
                        <Button size='sm' color='primary' onClick={_onChange}>
                            {__('Done')}
                        </Button>
                    </div>
                ),
            ];
        };

        const renderItem = item => {
            const { objectId, type } = item;

            const hnd = {
                key: `media-picker-selected-${objectId}`,
                cx,
                onItemSelect: _onItemSelect,
                onItemUnselect: _onItemUnselect,
                selection,
            };

            switch (type) {
                case 'IMAGE':
                    return <Image {...hnd} {...item} />;

                case 'VIDEO':
                    return <Video {...hnd} {...item} />;
            }
        };

        const render = () => {
            const { collapsible, data, dismissable, pref, uploads } = state;
            const items = _filter(data);
            const selected = getSelection();
            const hasItems = Object.keys(data).length > 0;

            return (
                <Dropzone
                    {...dropzoneProps}
                    className={cx('dropzone')}
                    files={{}}
                    onFileAdded={e => _onFileAdded(e)}
                    pref={pref}
                    ref={dropzoneRef}>
                    <Dialog
                        className={cx('dialog')}
                        collapsible={collapsible}
                        dismissable={dismissable}
                        header={_header()}
                        onDismiss={_onDismiss}
                        pref={pref}
                        ref={dialogRef}
                        style={style}>
                        <div className={cname()}>
                            <div className={cx('toolbar')}>
                                <div>
                                    <div className={cx('search-bar')}>
                                        <input
                                            type='text'
                                            className={cn({
                                                [cx('search')]: true,
                                                expanded: !!search,
                                            })}
                                            onFocus={e => e.target.select()}
                                            onChange={e =>
                                                setSearch(e.target.value)
                                            }
                                            placeholder={__('Search')}
                                            value={search}
                                        />
                                        <Icon name='Feather.Search' />
                                    </div>
                                    {renderActions()}
                                </div>
                            </div>
                            <div className={cx('container')}>
                                <div className={cx('container-library')}>
                                    <Scrollbars height='100%'>
                                        <Uploads
                                            onRemoveFile={_onFileRemoved}
                                        />
                                        <div className='content'>
                                            {Object.values(items).map(
                                                renderItem,
                                            )}
                                        </div>
                                    </Scrollbars>
                                </div>
                                {selection.length > 0 && (
                                    <div className={cx('container-selection')}>
                                        <Scrollbars height='100%'>
                                            <div className='content'>
                                                {Object.values(selected).map(
                                                    renderItem,
                                                )}
                                            </div>
                                        </Scrollbars>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Dialog>
                </Dropzone>
            );
        };

        return render();
    },
);

/**
 * @api {RegisteredComponent} <MediaPicker/> MediaPicker
 * @apiDescription Dialog that displays the Media Objects and allows for one or
 many to be selected. The `MediaPicker` can be used as a `Modal Dialog` or as an
 inline `Dialog`. When used as a `Modal`, be sure to set `dismissable={true}`. When used inline, be sure to set `collapsible={true}` and the `pref` property if you want to remember the collapsed state.
 * @apiName MediaPicker
 * @apiGroup Registered Component
 * @apiParam {String} ID The unique ID used when registering the component's handle function.
 * @apiParam {String} className HTML class to apply to the wrapper container.
 * @apiParam {Boolean} [collapsible=false] Whether the dialog can be collapsed and expanded.
 * @apiParam {Boolean} [confirm=false] Whether selection requires a confirmation before the `onChange` event is triggered.
 * @apiParam {Boolean} [dismissable=false] Whether the dialog displays a close button to exit.
 * @apiParam {Mixed} [filter] Filter to apply to the media fetch used to display the Media Objects. Valid values: `Array`, `Function`, `String`.
 * @apiParam {Object} [header] Header configuration object. See [http://ui.reactium.io/toolkit/components/dialog-molecule](Reactium UI - Dialog) for more details.
 * @apiParam {Number} [maxSelect=1] Number greater than or equal to 1 representing the number of Media Objects that can be selected. When the value is less than 1, any number of items can be selected.
 * @apiParam {Number} [minSelect=1] Number greater than or equal to 1 representing the number of Media Objects that must be selected before the `onChange` event is triggered. When the value is less than 1, no mininum is required.
 * @apiParam {Function} [onCancel] Callback executed when the `onCancel` event is triggered.
 * @apiParam {Function} [onChange] Callback executed when the `onChange` event is triggered.
 * @apiParam {Function} [onDismiss] Callback executed when the `onDismiss` event is triggered.
 * @apiParam {Function} [onError] Callback executed when the `onError` event is triggered.
 * @apiParam {Function} [onItemSelect] Callback executed when the `onItemSelect` event is triggered.
 * @apiParam {Function} [onItemUnselect] Callback executed when the `onItemUnselect` event is triggered.
 * @apiParam {Function} [onShow] Callback executed when the `onShow` event is triggered.
 * @apiParam {String} [pref] Preferrance id used when the Dialog is collapsible. See [http://ui.reactium.io/toolkit/components/dialog-molecule](Reactium UI - Dialog) for more details.
 * @apiParam {String} [search] Filter Media Objects based on the search term entered.
 * @apiParam {Array} [searchFields] Array of fields to search relative to the Media Object.
 * @apiParam {Array} [selection] Array of Media Object IDs. Use this if you wish to have Media Objects selected by default.
 * @apiParam {Object} [style] Style object to apply to the wrapper container.
 * @apiParam {Mixed} [title] `String` or `Node` that displays the Dialog title. This value is used if you do not specify a `header` object.
 * @apiParam Event cancel Triggered when the selection is canceled. This event only fires if `confirm` is set to true.
 * @apiParam Event change Triggered when selection has changed. If `confirm` is true, it is triggred when the `done` button is pressed.
 * @apiParam Event dismiss Triggered when the Dialog has been closed.
 * @apiParam Event error Triggered when an error occurs.
 * @apiParam Event onItemSelect Triggered when an item is selected.
 * @apiParam Event onItemUnselect Triggered when an item has been un-selected.
 * @apiParam Event onShow Triggered when the Dialog is shown.
 * @apiExample Modal Usage:
import React, { useSelect } from 'react';
import { useHandle, useHookComponent } from 'reactium-core/sdk';

export default MyComponent = () => {
    // Selected state
    const [selection, setSelection] = useState([]);

    // Get the MediaPicker component
    const MediaPicker = useHookComponent('MediaPicker');

    // Get the modal from the AdminTools handle
    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');

    // On MediaPicker change handler
    const _onMediaPickerChange = e => {
        console.log(e.target.value);
        setSelection(e.target.selection);
    };

    // Show picker function
    const _showPicker = () => {
        Modal.show(
            <MediaPicker
                confirm
                dismissable
                filter='image'
                onChange={_onMediaPickerChange}
                onDismiss={() => Modal.dismiss()}
                title='Select Image'
            />,
        );
    };

    return (
        <div>
            {selection.length > 0 && <div>{selection.join(', ')}}</div>
            <button type='button' onClick={_showPicker}>Show Picker</button>
        </div>
    );
};
 * @apiExample Inline Usage:
export default MyComponent = () => {
    // Get the MediaPicker component
    const MediaPicker = useHookComponent('MediaPicker');

    // On MediaPicker select handler
    const _onVideoSelected = e => {
        console.log(e.target.value);
        setSelection(e.target.selection);
    };

    return (
        <div>
            <MediaPicker
                collapsible
                filter='video'
                onItemSelect={_onVideoSelected}
                pref='admin.dialog.media.video'
                title='Select Video'
            />
        </div>
    );
};
 */
MediaPickerComponent.propTypes = {
    ID: PropTypes.string,
    className: PropTypes.string,
    collapsible: PropTypes.bool,
    confirm: PropTypes.bool,
    dismissable: PropTypes.bool,
    filter: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.func,
        PropTypes.string,
    ]),
    header: Dialog.propTypes.header,
    maxSelect: PropTypes.number,
    minSelect: PropTypes.number,
    namespace: PropTypes.string,
    onCancel: PropTypes.func,
    onChange: PropTypes.func,
    onDismiss: PropTypes.func,
    onError: PropTypes.func,
    onItemSelect: PropTypes.func,
    onItemUnselect: PropTypes.func,
    onShow: PropTypes.func,
    pref: Dialog.propTypes.pref,
    search: PropTypes.string,
    searchFields: PropTypes.arrayOf(PropTypes.string),
    selection: PropTypes.array,
    style: PropTypes.object,
    title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

MediaPickerComponent.defaultProps = {
    ID: 'MediaPicker',
    confirm: false,
    collapsible: false,
    dismissable: false,
    dropzoneProps: {
        config: {
            chunking: false,
            clickable: true,
            maxFiles: 1,
            previewTemplate:
                '<div class="dz-preview dz-file-preview"><span data-dz-name></div>',
        },
        debug: false,
    },
    filter: Object.keys(ENUMS.TYPE),
    maxSelect: 1,
    minSelect: 1,
    namespace: 'ar-media-picker',
    onCancel: noop,
    onChange: noop,
    onDismiss: noop,
    onError: noop,
    onItemSelect: noop,
    onItemUnselect: noop,
    onShow: noop,
    searchFields: [
        'ext',
        'filename',
        'meta.description',
        'meta.tags',
        'meta.title',
        'type',
        'url',
    ],
    selection: [],
    title: __('Select Media'),
};

export { Image, Video, MediaPickerComponent as default };
