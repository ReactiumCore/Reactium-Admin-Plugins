import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import ENUMS from 'components/Admin/Media/enums';
import { Scrollbars } from 'react-custom-scrollbars';

import Reactium, {
    __,
    useDerivedState,
    useHandle,
    useHookComponent,
    useRegisterHandle,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

import {
    Button,
    Dialog,
    Icon,
    Prefs,
    Scene,
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
        ID = 'MediaPicker',
        header,
        onCancel,
        onChange,
        onDismiss,
        onItemSelect,
        onItemUnSelect,
        onShow,
        pref,
        style,
        ...props
    },
    ref,
) => {
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
        namespace: op.get(props, 'namespace'),
        status: ENUMS.STATUS.INIT,
        title: op.get(props, 'title'),
        visible: false,
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

        Reactium.Cloud.run('media', { page: -1 })
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

    const _onCancel = async () => {
        await onCancel({ selection, target: handle(), type: 'cancel' });
        _onDismiss();
    };

    const _onChange = async () => {
        if (selection.length > 0) {
            await onChange({ selection, target: handle(), type: 'change' });
        }
        _onDismiss();
    };

    const _onDismiss = async () => {
        await onDismiss({ selection, target: handle(), type: 'dismiss' });
    };

    const _onShow = async () => {
        const { visible } = state;
        if (visible === true) return;
        setState({ visible: true });
        await onShow({ selection, target: handle(), type: 'show' });
    };

    const _header = () => {
        if (header) return header;

        const { title } = state;
        const elements =
            selection.length > 0
                ? [
                      <Button size='sm' color='danger' onClick={_onCancel}>
                          Cancel
                      </Button>,
                      <Button size='sm' color='primary' onClick={_onChange}>
                          Done
                      </Button>,
                  ]
                : [];

        return { title, elements };
    };

    const handle = () => ({
        props,
        search,
        setState,
        state,
    });

    const handleDeps = [ID, filter, search, selection, op.get(state, 'title')];

    useImperativeHandle(ref, handle, handleDeps);

    useRegisterHandle(ID, handle, handleDeps);

    useEffect(() => {
        _onShow();
    }, [op.get(state, 'visible')]);

    useEffect(() => {
        const { status } = state;
        if (status === ENUMS.STATUS.INIT) _fetch();
    }, [op.get(state, 'status')]);

    const render = () => {
        const dismissable = selection.length < 1;
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
                                value={search}
                            />
                            <Icon name='Feather.Search' />
                        </div>
                    </div>
                    <div className={cx('container')}>
                        <div className={cx('container-library')}>
                            <Scrollbars height='100%'>
                                <div className='content'></div>
                            </Scrollbars>
                        </div>
                        {selection.length > 0 && (
                            <div className={cx('container-selection')}>
                                <Scrollbars height='100%'>
                                    <div className='content'></div>
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
    confirm: PropTypes.bool,
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
    onItemUnSelect: PropTypes.func,
    onShow: PropTypes.func,
    pref: Dialog.propTypes.pref,
    search: PropTypes.string,
    selection: PropTypes.array,
    style: PropTypes.object,
    title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

MediaPicker.defaultProps = {
    confirm: false,
    confirmMessage: ENUMS.TEXT.CONFIRM,
    filter: Object.keys(ENUMS.TYPE),
    maxSelect: -1,
    multiSelect: false,
    namespace: 'ar-media-picker',
    onCancel: noop,
    onChange: noop,
    onDismiss: noop,
    onItemSelect: noop,
    onItemUnSelect: noop,
    onShow: noop,
    selection: [],
    title: __('Select Media'),
};

export default MediaPicker;
