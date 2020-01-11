import _ from 'underscore';
import cn from 'classnames';
import Image from './Image';
import Video from './Video';
import op from 'object-path';
import PropTypes from 'prop-types';
import ENUMS from 'components/Admin/Media/enums';
import { Scrollbars } from 'react-custom-scrollbars';

import Reactium, {
    __,
    useDerivedState,
    useHandle,
    useRegisterHandle,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';

import {
    Button,
    Dialog,
    Dropdown,
    Icon,
    Spinner,
} from '@atomic-reactor/reactium-ui';

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * MediaPicker
 * -----------------------------------------------------------------------------
 */

let MediaPicker = (
    {
        header,
        onCancel,
        onChange,
        onDismiss,
        onItemSelect,
        onItemUnselect,
        onShow,
        pref,
        style,
        ...props
    },
    ref,
) => {
    const ID = op.get(props, 'ID');
    const internals = ['ID', 'filter', 'search', 'selection'];
    const stateFromProps = Object.keys(props)
        .filter(key => !internals.includes(key))
        .reduce((obj, key) => {
            obj[key] = op.get(props, key);
            return obj;
        }, {});

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
        visible: false,
        ...stateFromProps,
    });

    const cname = () => {
        const { className, namespace } = state;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    const cx = cls => _.compact([op.get(state, 'namespace'), cls]).join('-');

    const _fetch = () => {
        const { fetched, status } = state;
        if (status === ENUMS.STATUS.PENDING || fetched === true) return;

        setState({ status: ENUMS.STATUS.PENDING });

        //Reactium.Cloud.run('media', { page: -1 })
        Reactium.Media.fetch({ page: -1 })
            .then(results =>
                setState({
                    data: results.files,
                    directories: results.directories,
                    error: null,
                    fetched: true,
                    status: ENUMS.STATUS.READY,
                }),
            )
            .catch(error =>
                setState({
                    error,
                    fetched: false,
                    status: ENUMS.STATUS.READY,
                }),
            );
    };

    const _filter = data => {
        let { directory, searchFields } = state;
        const dataArray = Object.values(data);

        let filtered;

        if (typeof filter === 'function') {
            filtered = dataArray.filter((item, i) => filter(item, search, i));
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

    const _onCancel = async () => {
        await onCancel({
            selection: getSelection(),
            target: handle(),
            type: 'cancel',
        });
        _onDismiss();
    };

    const _onChange = async () => {
        if (selection.length > 0) {
            await onChange({
                selection: getSelection(),
                target: handle(),
                type: 'change',
            });
        }
        _onDismiss();
    };

    const _onDirectoryChange = directory => setState({ directory });

    const _onDismiss = async () => {
        await onDismiss({
            selection: getSelection(),
            target: handle(),
            type: 'dismiss',
        });
    };

    const _onItemSelect = async objectId => {
        const { maxSelect, multiSelect } = state;

        const sel = multiSelect ? Array.from(selection) : [];

        if (multiSelect && maxSelect !== -1 && sel.length >= maxSelect) return;

        sel.push(objectId);
        setSelection(_.uniq(sel));

        await onItemSelect({
            selection: sel,
            target: handle(),
            type: 'select',
        });
    };

    const _onItemUnselect = async objectId => {
        const { multiSelect } = state;
        if (multiSelect === false) return;

        const sel = _.without(Array.from(selection), objectId);
        setSelection(_.uniq(sel));

        await onItemUnselect({
            selection: sel,
            target: handle(),
            type: 'unselect',
        });
    };

    const _onShow = async () => {
        const { visible } = state;
        if (visible === true) return;
        setState({ visible: true });
        await onShow({
            selection: getSelection(),
            target: handle(),
            type: 'show',
        });
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
        props,
        search,
        setFilter,
        setSearch,
        setSelection,
        setState,
        state,
    });

    const handleDeps = [
        ID,
        filter,
        search,
        selection,
        op.get(state, 'data'),
        op.get(state, 'title'),
    ];

    useImperativeHandle(ref, handle, handleDeps);

    useRegisterHandle(ID, handle, handleDeps);

    // Trigger onShow()
    useEffect(() => {
        _onShow();
    }, [op.get(state, 'visible')]);

    // Fetch
    useEffect(() => {
        const { status } = state;
        if (status === ENUMS.STATUS.INIT) _fetch();
    }, [op.get(state, 'status')]);

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
        const { collapsible, confirm, data, dismissable } = state;
        const items = _filter(data);
        const selected = getSelection();
        const hasItems = Object.keys(data).length > 0;

        return (
            <Dialog
                className={cx('dialog')}
                collapsible={false}
                dismissable={dismissable}
                header={_header()}
                onDismiss={_onDismiss}
                pref={pref}
                style={style}>
                <div className={cname()}>
                    <div className={cx('toolbar')}>
                        <div className={cx('search-bar')}>
                            <input
                                type='text'
                                className={cn({
                                    [cx('search')]: true,
                                    expanded: !!search,
                                })}
                                onFocus={e => e.target.select()}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={__('Search')}
                                value={search}
                            />
                            <Icon name='Feather.Search' />
                        </div>
                        {renderActions()}
                    </div>
                    <div className={cx('container')}>
                        <div className={cx('container-library')}>
                            <Scrollbars height='100%'>
                                <div className='content'>
                                    {Object.values(items).map(renderItem)}
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
        );
    };

    return render();
};

MediaPicker = forwardRef(MediaPicker);

MediaPicker.propTypes = {
    className: PropTypes.string,
    collapsible: PropTypes.bool,
    confirm: PropTypes.bool,
    dismissable: PropTypes.bool,
    confirmMessage: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    filter: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.func,
        PropTypes.string,
    ]),
    header: Dialog.propTypes.header,
    maxSelect: PropTypes.number,
    multiSelect: PropTypes.bool,
    namespace: PropTypes.string,
    onCancel: PropTypes.func,
    onChange: PropTypes.func,
    onDismiss: PropTypes.func,
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

MediaPicker.defaultProps = {
    ID: 'MediaPicker',
    confirm: true,
    collapsible: false,
    dismissable: true,
    filter: Object.keys(ENUMS.TYPE),
    maxSelect: -1,
    multiSelect: false,
    namespace: 'ar-media-picker',
    onCancel: noop,
    onChange: noop,
    onDismiss: noop,
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

export { Image, Video, MediaPicker as default };
