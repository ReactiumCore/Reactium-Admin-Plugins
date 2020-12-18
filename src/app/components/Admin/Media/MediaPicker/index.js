import lunr from 'lunr';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ENUMS from '../enums';
import camelcase from 'camelcase';
import useData from '../_utils/useData';
import { Scrollbars } from 'react-custom-scrollbars';

import Item from './Item';
import propTypes from './propTypes';
import Placeholder from './Placeholder';
import defaultProps from './defaultProps';

import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from 'react';

import Reactium, {
    __,
    Zone,
    useRefs,
    useStatus,
    ComponentEvent,
    useEventHandle,
    useHookComponent,
} from 'reactium-core/sdk';

const fetchMedia = () =>
    Reactium.Media.fetch({ page: -1 }).then(results => ({
        error: null,
        fetched: true,
        update: Date.now(),
        data: results.files,
        status: ENUMS.STATUS.READY,
        directories: results.directories,
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
    const { Button, Icon, Spinner } = useHookComponent('ReactiumUI');

    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const refs = useRefs();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, updateState] = useState({
        ...props,
        uploads: {},
        filters: _.isString(op.get(props, 'filters', []))
            ? [props.filters]
            : props.filters,
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

    const setData = (newData, silent) => {
        if (unMounted()) return;
        updateData(newData, silent);
        setState({ updated: Date.now() }, silent);
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
        _.defer(() => {
            if (unMounted()) return;
            updateState({ ...newState, update: Date.now() });
        });
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
        filters = _.isString(filters) ? [filters] : filters;

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

        files = _.sortBy(files, 'updatedAt').reverse();

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
        const { confirm, maxSelect } = state;

        const item = op.get(files, objectId);
        if (!item) return;

        let selection =
            maxSelect === 1 ? [] : Array.from(op.get(state, 'selection', []));

        selection = Array.isArray(selection) ? selection : [selection];

        if (maxSelect && maxSelect > 1 && selection.length >= maxSelect) {
            const message = __(
                'Max selection of (%max) already reached',
            ).replace(/\%max/gi, maxSelect);

            const error = { message, icon: 'Feather.AlertOctagon' };

            setState({ error }, true);
            dispatch('error', { error, selection, max: maxSelect }, onError);
            setStatus(ENUMS.STATUS.ERROR, true);
            return;
        }

        const previous = Array.from(selection);

        selection.push(item);

        const count = selection.length;
        const remaining = maxSelect && maxSelect > 0 ? maxSelect - count : null;

        dispatch('select', { item, selection, remaining }, onItemSelect);
        dispatch(
            'change',
            {
                selection,
                previous,
                item,
                remaining,
            },
            onChange,
        );

        setStatus(ENUMS.STATUS.UPDATE);
        setState({ remaining, selection });

        if (confirm !== true) submit(selection);
    };

    const submit = selection => {
        selection = Array.isArray(selection)
            ? selection
            : op.get(state, 'selection', []);

        selection = !Array.isArray(selection) ? [selection] : selection;

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
    });

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

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return !data ? (
        <div className={cx('spinner')}>
            <Spinner />
        </div>
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
                            <div className={cn('block', cx('item'), 'dz-btn')}>
                                <div>
                                    <Icon name='Feather.UploadCloud' />
                                    <Button
                                        readOnly
                                        style={{ width: '50%', maxWidth: 150 }}
                                        size={Button.ENUMS.SIZE.SM}
                                        appearance={
                                            Button.ENUMS.APPEARANCE.PILL
                                        }>
                                        {__('Upload')}
                                    </Button>
                                </div>
                            </div>
                            {Object.values(state.uploads).map(upload => (
                                <Placeholder
                                    {...upload}
                                    picker={handle}
                                    key={`upload-${upload.uuid}`}
                                />
                            ))}
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
MediaPicker.propTypes = propTypes;
MediaPicker.defaultProps = defaultProps;

export * from './TypeSelect';
export { MediaPicker, MediaPicker as default };
