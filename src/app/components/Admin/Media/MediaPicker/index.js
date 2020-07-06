import lunr from 'lunr';
import _ from 'underscore';
import cn from 'classnames';
import Image from './Image';
import Video from './Video';
import op from 'object-path';
import ENUMS from '../enums';
import camelcase from 'camelcase';
import PropTypes from 'prop-types';
import useData from '../_utils/useData';
import { Scrollbars } from 'react-custom-scrollbars';

import Reactium, {
    __,
    ComponentEvent,
    useAsyncEffect,
    useEventHandle,
    useHookComponent,
    useRefs,
    useStatus,
    Zone,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useState,
} from 'react';

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
 * Hook Component: MediaPicker
 * -----------------------------------------------------------------------------
 */
let MediaPicker = (initialProps, ref) => {
    const {
        children,
        className,
        delayFetch,
        namespace,
        onCancel,
        onChange,
        onDismiss,
        onError,
        onInit,
        onItemSelect,
        onItemUnselect,
        onLoad,
        onMount,
        onStatus,
        onSubmit,
        onUnMount,
        ...props
    } = initialProps;

    const initialData = op.get(props, 'data');

    // -------------------------------------------------------------------------
    // Components
    // -------------------------------------------------------------------------
    const { Icon, Spinner } = useHookComponent('ReactiumUI');

    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const refs = useRefs();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, updateState] = useState({
        ...props,
    });

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.INIT);

    // -------------------------------------------------------------------------
    // Media Data
    // -------------------------------------------------------------------------
    const [data, updateData] = useData(
        fetchMedia,
        'media-retrieve',
        delayFetch,
        initialData,
    );

    const setData = newData => {
        if (unMounted()) return;
        updateData(newData);
        setState({ updated: Date.now() });
    };

    const setHandle = newHandle => {
        if (unMounted()) return;
        updateHandle(newHandle);
    };

    const setState = (newState, val) => {
        if (unMounted()) return;

        if (_.isString(newState)) {
            newState = { [newState]: val };
        }

        newState = newState ? { ...state, ...newState } : {};
        updateState(newState);
    };

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------

    // cx(suffix:String);
    const cx = Reactium.Utils.cxFactory(className || namespace);

    const dismiss = () => {
        if (!state.dismissable) return;
        setStatus(ENUMS.STATUS.DISMISS, true);
    };

    // dispatch(eventType:String, eventData:Object, callback:Function);
    const dispatch = (eventType, eventData, callback) => {
        if (eventType !== 'mount' && unMounted()) return;

        if (!_.isObject(eventData)) eventData = { data: eventData };

        eventType = String(eventType)
            .replace(/ /i, '-')
            .replace(/[^a-z0-9\-\_]/gi)
            .toLowerCase();

        const evt = new ComponentEvent(eventType, eventData);

        handle.dispatchEvent(evt);

        Reactium.Hook.runSync(`media-picker-${eventType}`, evt, handle);

        if (typeof callback === 'function') callback(evt);

        if (state.debug === true) {
            if (eventType !== 'status') {
                console.log(eventType, evt);
            } else {
                console.log('\t\t', eventType, evt);
            }
        }
    };

    const getDirectories = () => {
        if (!data) return [];
        let { directories = [] } = data;
        return directories;
    };

    const getFiles = () => {
        // return empty array if no data
        if (!data) {
            return [];
        }

        // get parameters from state
        let { directory = 'all', filter, filters = [], search, type } = state;

        let files = op.get(data, 'data', {});

        // convert data Object into array
        files = Object.values(files);

        // return if files array empty
        if (files.length < 1) {
            return [];
        }

        // pass the data over to the filter function if specified as a function
        if (typeof filter === 'function') return files.filter(filter);

        // filter files against directory and type values
        files = files.filter(file => {
            // folder match
            if (directory !== 'all') {
                if (file.directory !== directory) return false;
            }

            // type match
            if (filters.length > 0 && !filters.includes('all')) {
                if (!filters.includes(file.type)) return false;
            }

            if (type !== 'all') {
                if (file.type !== type) return false;
            }

            return true;
        });

        // do a text search on the searchField properties
        files = search ? textSearch(`${String(search).trim()}*`, files) : files;

        // run media-picker-files hook
        Reactium.Hook.runSync('media-picker-files', files, handle);

        return files;
    };

    const getPage = () => {
        const files = getFiles();
        if (files.length < 1) return [];

        let { itemsPerPage, page = 1 } = state;

        const chunks = _.chunk(files, itemsPerPage);

        const pages = chunks.length;

        page = Math.min(pages, page);
        page = Math.max(1, page) - 1;

        return chunks[page];
    };

    const textSearch = (text, files) => {
        files = files || Object.values(op.get(data, 'data', {}));
        const { searchFields = [] } = state;
        return searchFields.length < 1
            ? files
            : _.pluck(
                  lunr(function() {
                      const lnr = this;
                      lnr.ref('objectId');

                      // camelcase object path field names
                      searchFields.forEach(field => {
                          field = String(field);
                          field = field.includes('.')
                              ? camelcase(field.replace(/\./g, '-'))
                              : field;

                          // add field to lunr
                          lnr.field(field);
                      });

                      // map file data to match camelcased field names
                      files.forEach(file => {
                          let obj = searchFields.reduce((o, field) => {
                              const key = field.includes('.')
                                  ? camelcase(field.replace(/\./g, '-'))
                                  : field;

                              o[key] = op.get(file, field);

                              return o;
                          }, {});

                          obj['objectId'] = file.objectId;
                          obj['directory'] = file.directory;
                          obj['type'] = file.type;

                          // add mapped object to lunr
                          lnr.add(obj);
                      });
                  }).search(text),
                  'ref',
              ).map(objectId => _.findWhere(files, { objectId }));
    };

    const isSelected = objectId => {
        const { selection = [] } = state;
        return !!_.findWhere(selection, { objectId });
    };

    const search = text => setState({ search: text });

    const select = objectId => {
        const { data: files = {} } = data;
        let { maxSelect, selection = [] } = state;

        if (maxSelect && maxSelect > 0) {
            if (maxSelect === 1 && selection.length === maxSelect) {
                selection = [];
            }

            if (maxSelect > 1 && selection.length >= maxSelect) {
                const message = __(
                    'Max selection of (%max) already reached',
                ).replace(/\%max/gi, maxSelect);

                const error = { message, icon: 'Feather.AlertOctagon' };

                setState({ error }, true);
                dispatch(
                    'error',
                    { error, selection, max: maxSelect },
                    onError,
                );
                setStatus(ENUMS.STATUS.ERROR, true);
                return;
            }
        }

        const item = op.get(files, objectId);
        const previous = Array.from(selection);

        selection.push(item);

        const ids = _.chain(selection)
            .pluck('objectId')
            .uniq()
            .value();

        const newSelection = ids.map(id => op.get(files, id));

        const count = newSelection.length;
        const remaining = maxSelect && maxSelect > 0 ? maxSelect - count : null;

        setState({ remaining, selection: newSelection }, true);
        dispatch(
            'select',
            { item, selection: newSelection, remaining },
            onItemSelect,
        );
        dispatch(
            'change',
            {
                current: newSelection,
                previous,
                item,
                remaining,
            },
            onChange,
        );
        setStatus(ENUMS.STATUS.UPDATE, true);
    };

    const submit = () => {
        const { selection = [] } = state;
        dispatch('submit', { selection }, onSubmit);
    };

    // unmount();
    const unMounted = () => !refs.get('media.picker.container');

    const unselect = objectId => {
        const { maxSelect, selection = [] } = state;
        const previous = Array.from(selection);

        const idx = _.findIndex(selection, { objectId });
        const item = selection[idx];

        selection.splice(idx, 1);

        const count = selection.length;
        let remaining = maxSelect && maxSelect > 0 ? maxSelect - count : null;

        setState({ remaining, selection }, true);
        dispatch('unselect', { item, selection, remaining }, onItemUnselect);
        dispatch(
            'change',
            { current: selection, previous, item, remaining },
            onChange,
        );
        setStatus(ENUMS.STATUS.UPDATE, true);
    };

    const unselectAll = () =>
        setState({ remaining: state.maxSelect, selection: [] });

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------
    const _handle = () => ({
        children,
        className,
        cx,
        data,
        directories: getDirectories(),
        dismiss,
        dispatch,
        ENUMS,
        files: getFiles(),
        isStatus,
        namespace,
        onStatus,
        props,
        refs,
        search,
        select,
        setData,
        setState,
        setStatus,
        state,
        status,
        submit,
        unMounted,
        unselect,
        unselectAll,
    });

    const [handle, updateHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    // Mount/UnMount
    useEffect(() => {
        dispatch('mount', null, onMount);

        return () => {
            dispatch('unmount', null, onUnMount);
        };
    }, []);

    // Status change
    useEffect(() => {
        if (status) {
            dispatch(
                'status',
                { status: String(status).toUpperCase() },
                onStatus,
            );
        }

        if (isStatus(ENUMS.STATUS.PENDING)) {
            setStatus(ENUMS.STATUS.INIT, true);
            return;
        }

        if (isStatus(ENUMS.STATUS.INIT)) {
            dispatch(ENUMS.STATUS.INIT, null, onInit);
            return;
        }

        if (isStatus(ENUMS.STATUS.LOADING)) {
            dispatch(ENUMS.STATUS.LOADING, null);
            return;
        }

        if (isStatus(ENUMS.STATUS.LOADED)) {
            dispatch(ENUMS.STATUS.LOADED, { data }, onLoad);
            return;
        }

        if (isStatus(ENUMS.STATUS.CANCELED)) {
            dispatch(ENUMS.STATUS.CANCELED, null, onCancel);
            return;
        }

        if (isStatus(ENUMS.STATUS.DISMISS)) {
            dispatch(ENUMS.STATUS.DISMISS, null, onDismiss);
            return;
        }
    }, [data, status, state.selection]);

    // Handle update
    useEffect(() => {
        const newHandle = _handle();

        // shallow compare the handle
        if (_.isEqual(newHandle, handle)) return;

        // map newHandle onto handle
        Object.entries(newHandle).forEach(([key, value]) =>
            op.set(handle, key, value),
        );

        setHandle(handle);
    }, [
        children,
        data,
        state.directory,
        state.page,
        state.pages,
        state.search,
        state.selection,
        state.type,
        status,
    ]);

    // page change
    useEffect(() => {
        const { page, pages } = state;
        dispatch('page-change', { page, pages });
    }, [state.page, state.pages]);

    // page count
    useEffect(() => {
        const files = getFiles();
        const { itemsPerPage } = state;

        const pages = Math.max(Math.ceil(files.length / itemsPerPage), 1);
        if (pages !== state.pages) setState({ pages });
    });

    // Data loaded
    useEffect(() => {
        if (!data) {
            if (
                isStatus(ENUMS.STATUS.INIT) &&
                !isStatus(ENUMS.STATUS.LOADING)
            ) {
                _.defer(() => {
                    if (unMounted()) return;
                    setStatus(ENUMS.STATUS.LOADING, true);
                });
            }
        } else {
            let { itemsPerPage } = state;
            itemsPerPage = Math.max(1, itemsPerPage);
            const count = getFiles().length;
            const pages = Math.ceil(count / itemsPerPage);
            setState({ pages }, true);
            setStatus(ENUMS.STATUS.LOADED, true);
        }
    }, [data]);

    // Zone components
    useAsyncEffect(async () => {
        const components = await Promise.all([
            Reactium.Zone.addComponent({
                id: cx('dismiss-button'),
                component: DismissButton,
                order: Reactium.Enums.priority.neutral,
                zone: cx('toolbar'),
            }),

            Reactium.Zone.addComponent({
                id: cx('title'),
                component: Title,
                order: Reactium.Enums.priority.neutral,
                zone: cx('toolbar'),
            }),

            Reactium.Zone.addComponent({
                id: cx('remaining'),
                component: Remaining,
                order: Reactium.Enums.priority.neutral,
                zone: cx('toolbar'),
            }),

            Reactium.Zone.addComponent({
                id: cx('directory-select'),
                component: DirectorySelect,
                order: Reactium.Enums.priority.neutral,
                zone: cx('toolbar'),
            }),

            Reactium.Zone.addComponent({
                id: cx('type-select'),
                component: TypeSelect,
                order: Reactium.Enums.priority.neutral,
                zone: cx('toolbar'),
            }),

            Reactium.Zone.addComponent({
                id: cx('search'),
                component: SearchInput,
                order: Reactium.Enums.priority.neutral,
                zone: cx('toolbar'),
            }),

            Reactium.Zone.addComponent({
                id: cx('pagination'),
                component: PageNav,
                order: Reactium.Enums.priority.neutral,
                zone: cx('footer'),
            }),

            Reactium.Zone.addComponent({
                id: cx('submit-button'),
                component: SubmitButton,
                order: Reactium.Enums.priority.neutral,
                zone: cx('footer'),
            }),
        ]);

        return () => {
            // clean up on unmount
            components.forEach(id => Reactium.Zone.removeComponent(id));
        };
    }, []);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return !data ? (
        <Spinner />
    ) : (
        <div
            ref={elm => refs.set('media.picker.container', elm)}
            className={cx()}>
            <div className={cx('toolbar')}>
                <Zone zone={cx('toolbar')} picker={handle} />
            </div>
            <div className={cx('content')}>
                <div className={cx('library')}>
                    <Scrollbars
                        ref={elm => refs.set('media.picker.library', elm)}>
                        <div className='grid'>
                            {getPage().map(file => (
                                <Item
                                    key={`mpi-${file.objectId}`}
                                    {...file}
                                    handle={handle}
                                    onItemSelect={select}
                                    onItemUnselect={unselect}
                                    selected={isSelected(file.objectId)}
                                />
                            ))}
                        </div>
                    </Scrollbars>
                </div>
                {state.confirm === true && (
                    <div className={cx('selection')}>
                        {state.selection.length > 0 ? (
                            <Scrollbars>
                                <div className='grid'>
                                    {Array.from(state.selection)
                                        .reverse()
                                        .map(file => (
                                            <Item
                                                key={`mpsi-${file.objectId}`}
                                                {...file}
                                                handle={handle}
                                                onItemSelect={select}
                                                onItemUnselect={unselect}
                                                selected
                                            />
                                        ))}
                                </div>
                            </Scrollbars>
                        ) : (
                            <div className={cx('no-selection')}>
                                <div className={cx('no-selection-icon')}>
                                    <Icon name='Linear.FingerTap' />
                                </div>
                                <div className={cx('no-selection-label')}>
                                    {state.maxSelect === 1
                                        ? __('Select A File')
                                        : __('Select Files')}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className={cx('footer')}>
                <Zone zone={cx('footer')} picker={handle} />
            </div>
        </div>
    );
};

MediaPicker = forwardRef(MediaPicker);

MediaPicker.ENUMS = ENUMS;

MediaPicker.propTypes = {
    ID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    className: PropTypes.string,
    namespace: PropTypes.string,
    confirm: PropTypes.bool,
    data: PropTypes.object,
    debug: PropTypes.bool,
    delayFetch: PropTypes.number,
    directory: PropTypes.string,
    dismissable: PropTypes.bool,
    filter: PropTypes.func,
    filters: PropTypes.arrayOf(PropTypes.string),
    itemsPerPage: PropTypes.number,
    maxSelect: PropTypes.number,
    minSelect: PropTypes.number,
    namespace: PropTypes.string,
    onCancel: PropTypes.func,
    onChange: PropTypes.func,
    onDismiss: PropTypes.func,
    onError: PropTypes.func,
    onInit: PropTypes.func,
    onItemSelect: PropTypes.func,
    onItemUnselect: PropTypes.func,
    onLoad: PropTypes.func,
    onMount: PropTypes.func,
    onStatus: PropTypes.func,
    onSubmit: PropTypes.func,
    onUnMount: PropTypes.func,
    page: PropTypes.number,
    pages: PropTypes.number,
    search: PropTypes.string,
    searchFields: PropTypes.arrayOf(PropTypes.string),
    selection: PropTypes.array,
    submitLabel: PropTypes.node,
    title: PropTypes.node,
    type: PropTypes.string,
};

MediaPicker.defaultProps = {
    ID: 'MediaPicker',
    confirm: false,
    debug: false,
    directory: 'all',
    dismissible: false,
    filters: Object.keys(ENUMS.TYPE),
    itemsPerPage: 10,
    maxSelect: 1,
    minSelect: 0,
    namespace: 'ar-media-picker',
    page: 1,
    pages: 1,
    onCancel: noop,
    onChange: noop,
    onDismiss: noop,
    onError: noop,
    onInit: noop,
    onItemSelect: noop,
    onItemUnselect: noop,
    onLoad: noop,
    onMount: noop,
    onStatus: noop,
    onSubmit: noop,
    onUnMount: noop,
    searchFields: [
        'directory',
        'ext',
        'filename',
        'meta.description',
        'meta.tags',
        'meta.title',
        'type',
        'url',
    ],
    selection: [],
    submitLabel: __('Done'),
    title: __('Select Media'),
    type: 'all',
};

export { MediaPicker, MediaPicker as default };

const Item = ({ handle, ...item }) => {
    const type = String(op.get(item, 'type', 'FILE')).toUpperCase();

    switch (type) {
        case 'IMAGE':
            return <Image {...handle} {...item} />;

        case 'VIDEO':
            return <Video {...handle} {...item} />;

        default:
            return null;
    }
};

const Title = ({ picker }) => {
    const { cx, state } = picker;
    return <h4 className={cx('title')}>{state.title}</h4>;
};

const DismissButton = ({ picker }) => {
    const { cx, dismiss, state } = picker;
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return state.dismissable ? (
        <Button
            className={cx('toolbar-dismiss-button')}
            color={Button.ENUMS.COLOR.CLEAR}
            onClick={dismiss}>
            <Icon name='Feather.X' size={18} />
        </Button>
    ) : null;
};

const SubmitButton = ({ picker }) => {
    const { cx, submit, state } = picker;
    const selection = op.get(state, 'selection', []);
    const { Button } = useHookComponent('ReactiumUI');

    return selection.length > 0 && state.confirm === true ? (
        <div className={cx('footer-submit-container')}>
            <Button
                className={cx('footer-submit-button')}
                color={Button.ENUMS.COLOR.PRIMARY}
                onClick={submit}
                size={Button.ENUMS.SIZE.SM}>
                {state.submitLabel}
            </Button>
        </div>
    ) : null;
};

const SearchInput = ({ picker }) => {
    const { cx, search, state } = picker;
    const { Icon } = useHookComponent('ReactiumUI');

    return (
        <div className={cx('search-input')}>
            <input
                className={cn({ active: !!state.search })}
                defaultValue={state.search || ''}
                placeholder={__('Search')}
                type='input'
                onChange={e => search(e.target.value)}
            />
            <Icon name='Feather.Search' />
        </div>
    );
};

const DirectorySelect = ({ picker }) => {
    const { directories = [], cx, setState, state } = picker;
    const { directory = 'all', directoryLabel = ENUMS.TEXT.FOLDER_ALL } = state;

    const { Button, Dropdown, Icon } = useHookComponent('ReactiumUI');

    const data = () => {
        const dirs = Array.isArray(directories) ? directories : [];

        return _.chain([
            [
                {
                    value: 'all',
                    label: ENUMS.TEXT.FOLDER_ALL,
                },
            ],
            dirs.map(item => ({
                value: item,
                label: item,
            })),
        ])
            .flatten()
            .sortBy('label')
            .value();
    };

    const onItemClick = ({ item }) =>
        setState({
            page: 1,
            directory: item.value,
            directoryLabel: item.label,
        });

    const active = directory !== 'all';

    return directories.length > 0 ? (
        <div className={cx('directory-select')}>
            <Dropdown
                align={Dropdown.ENUMS.ALIGN.RIGHT}
                checkbox={false}
                data={data()}
                onItemClick={onItemClick}
                selection={[directory]}
                size={Button.ENUMS.SIZE.SM}
                verticalAlign={Dropdown.ENUMS.VALIGN.BOTTOM}>
                <Button
                    className={cx('directory-button')}
                    color={Button.ENUMS.COLOR.CLEAR}
                    data-dropdown-element>
                    {directory !== 'all' && (
                        <span className='label'>{directoryLabel}</span>
                    )}
                    <span className={cn('icon', { active })}>
                        <Icon name='Feather.Folder' />
                    </span>
                </Button>
            </Dropdown>
        </div>
    ) : null;
};

const TypeIcon = ({ type, ...props }) => {
    type = String(type).toLowerCase();

    const { Icon } = useHookComponent('ReactiumUI');

    const icons = {
        all: <Icon name='Feather.Filter' {...props} />,
        audio: <Icon name='Feather.Mic' {...props} />,
        clear: <Icon name='Feather.X' {...props} />,
        image: <Icon name='Feather.Camera' {...props} />,
        file: <Icon name='Feather.File' {...props} />,
        video: <Icon name='Feather.Video' {...props} />,
    };

    Reactium.Hook.runSync('media-picker-filter-icons', icons, type, props);

    return op.get(icons, type, null);
};

const TypeSelect = ({ picker }) => {
    const { cx, setState, state } = picker;
    let { filters = [], type = 'all' } = state;

    const { Button, Dropdown } = useHookComponent('ReactiumUI');

    filters.sort();

    const data = () => {
        return _.chain([
            type !== 'all'
                ? [
                      {
                          value: 'all',
                          label: <TypeIcon type='clear' />,
                      },
                  ]
                : null,
            filters.map(item => ({
                value: item,
                label: <TypeIcon type={item} />,
            })),
        ])
            .flatten()
            .compact()
            .value();
    };

    const onItemClick = ({ item }) => setState({ page: 1, type: item.value });

    const active = type !== 'all';

    return filters.length > 1 ? (
        <div className={cx('type-select')}>
            <Dropdown
                align={Dropdown.ENUMS.ALIGN.CENTER}
                checkbox={false}
                data={data()}
                onItemClick={onItemClick}
                selection={[type]}
                size={Button.ENUMS.SIZE.SM}>
                <Button
                    className={cx('type-button')}
                    color={Button.ENUMS.COLOR.CLEAR}
                    data-dropdown-element>
                    <span className={cn('icon', { active })}>
                        <TypeIcon type={type} />
                    </span>
                </Button>
            </Dropdown>
        </div>
    ) : null;
};

const PageNav = ({ picker }) => {
    const { cx, setState, state } = picker;
    const { page, pages } = state;

    const { Pagination } = useHookComponent('ReactiumUI');

    const onChange = (e, p) => {
        setState({ page: p });
    };

    return pages > 1 ? (
        <div className={cx('pagination')}>
            <Pagination
                page={page}
                pages={pages}
                numbers={3}
                onChange={onChange}
            />
        </div>
    ) : null;
};

const Remaining = ({ picker }) => {
    const { cx, state, unselectAll } = picker;
    const { remaining, maxSelect, selection = [] } = state;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const isVisible = selection.length > 0 && maxSelect && maxSelect !== 1;
    const msg = __('%count of %max')
        .replace(/\%count/gi, selection.length)
        .replace(/\%max/gi, maxSelect);

    return isVisible ? (
        <div className={cx('remaining')}>
            <div className={cx('remaining-label')}>{msg}</div>
            {remaining !== maxSelect && (
                <Button
                    className={cx('remaining-clear-button')}
                    color={Button.ENUMS.COLOR.CLEAR}
                    onClick={unselectAll}>
                    <Icon name='Feather.XSquare' />
                </Button>
            )}
        </div>
    ) : null;
};
