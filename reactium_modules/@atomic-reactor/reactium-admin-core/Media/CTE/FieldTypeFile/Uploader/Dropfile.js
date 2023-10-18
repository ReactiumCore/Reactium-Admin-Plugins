import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { v4 as UUID } from 'uuid';
import PropTypes from 'prop-types';
import DND from 'drag-and-drop-files';

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
} from 'react';

import Reactium, {
    __,
    useRefs,
    useSyncState,
    useDispatcher,
} from '@atomic-reactor/reactium-core/sdk';

const _onFileRead = (file) =>
    new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target.result);
        reader.onerror = (e) => rej(e);
        reader.readAsDataURL(file);
    });

// ** NOTE ** The onChange is pulled out on purpose
let Dropfile = ({ onChange, ...props }, ref) => {
    const prop = (...args) => op.get(props, ...args);

    const refs = useRefs();

    const acceptedFileTypes = useMemo(
        () => prop('acceptedFileTypes'),
        [prop('acceptedFileTypes')],
    );
    const excludedFileTypes = useMemo(
        () => prop('excludedFileTypes'),
        [prop('excludedFileTypes')],
    );
    const className = useMemo(() => prop('className'), [prop('className')]);
    const clickable = useMemo(() => prop('clickable'), [prop('clickable')]);
    const count = useMemo(() => prop('count'), [prop('count')]);
    const disabled = useMemo(() => prop('disabled'), [prop('disabled')]);
    const maxFiles = useMemo(() => prop('maxFiles'), [prop('maxFiles')]);
    const maxFileSize = useMemo(
        () => prop('maxFileSize'),
        [prop('maxFileSize')],
    );
    const namespace = useMemo(() => prop('namespace'), [prop('namespace')]);
    const style = useMemo(() => prop('style'), [prop('style')]);

    const state = useSyncState({
        acceptedFileTypes,
        className,
        clickable,
        count,
        disabled,
        excludedFileTypes,
        prev: null,
        init: false,
        maxFiles,
        maxFileSize,
        value: [],
    });

    const _dispatch = useDispatcher({ props, state });

    const dispatch = (...args) => {
        _dispatch(...args);
        return state;
    };

    const cx = useMemo(() => Reactium.Utils.cxFactory(namespace), [namespace]);

    const browse = useCallback(() => {
        if (isDisabled()) return;

        const elm = refs.get('input');
        if (!elm) return;
        elm.addEventListener('cancel', _onCancel);
        elm.click();
    }, []);

    const clear = useCallback(() => {
        state.set('value', null, false);
        state.set({ value: [], count: 0 });
    }, []);

    const disable = useCallback(() => state.set('disabled', true), []);

    const enable = useCallback(() => state.set('disabled', false), []);

    const forceRender = useCallback(() => state.set('updated', Date.now()), []);

    const isDisabled = useCallback(
        () => state.get('disabled'),
        [state.get('disabled')],
    );

    const isClickable = useCallback(() => state.get('clickable') && !isMaxed());

    const isEnabled = useCallback(() => !isDisabled(), []);

    const isInit = useCallback(() => state.get('init'), []);

    const isMaxed = useCallback(() => {
        const { maxFiles, count = 0 } = state.get();
        return maxFiles && maxFiles > 0 && count === maxFiles;
    }, []);

    const removeFiles = (ids) => {
        ids = _.chain([ids]).flatten().uniq().value();
        let value = Array.from(state.get('value') || []);

        const indices = _.without(
            ids
                .map((ID) => _.findIndex(value, { ID }))
                .sort()
                .reverse(),
            -1,
        );

        indices.forEach((idx) => {
            const file = value.splice(idx, 1);
            dispatch('file-removed', { detail: { file } });
        });

        let count = state.get('count') || 0;
        count -= indices.length;
        count = Math.max(0, count);

        state.set({ count, value });
    };

    const _onCancel = (e) => {
        e.target.removeEventListener('cancel', _onCancel);
        dispatch('cancel');
    };

    const _onClick = (e) => {
        if (!isClickable()) return;
        e.target.blur();
        browse();
    };

    const _onFileAdded = async (files) => {
        if (isDisabled()) return;

        files = Array.isArray(files) ? files : [files];

        const detail = { valid: true, errors: [] };

        files.forEach((file) => dispatch('validate', { detail, file }));

        if (detail.valid !== true) {
            dispatch('error', { detail });
            return;
        }

        let value = state.get('value');
        value = value || [];
        value = Array.from(value);

        const added = [];

        for (let file of files) {
            file.ID = UUID();
            file.dataURL = await _onFileRead(file);
            file._name = file.name;
            file.metadata = { size: file.size };

            added.push(file);
            value.push(file);
        }

        let count = state.get('count') || 0;
        count += added.length;

        state.set({ value, count });

        dispatch('file-added', { added, files: Array.from(value) });
    };

    const _onInit = () => {
        if (isInit()) return;
        const container = refs.get('container');
        if (!container) return;
        DND(container, _onFileAdded);
        state.set('init', true, false);
        dispatch('initialize');

        state.addEventListener('validate', _onValidate);
    };

    const _onInputChange = (e) => _onFileAdded(Array.from(e.target.files));

    const _onPropsChange = () => {
        state.props = { onChange, ...props };
    };

    const _onValueChange = () => {
        const { previous, value } = state.get();

        state.value = value || [];

        if (_.isEqual(previous, value)) return;

        if (previous) {
            const detail = { previous };
            state.addEventListener('change', onChange);
            dispatch('change', { value, detail });
            state.removeEventListener('change', onChange);
        }

        state.set('previous', value, false);

        forceRender();
    };

    const _onValidate = (e) => {
        if (e.detail.valid === false) return;

        const file = e.file;

        let {
            acceptedFileTypes = [],
            excludedFileTypes = [],
            maxFileSize,
        } = state.get();

        if (isMaxed()) {
            const error = new Error(
                String(__('maxFiles reached %count')).replace(
                    /%count/gi,
                    state.get('maxFiles'),
                ),
            );

            e.detail.valid = false;
            e.detail.errors.push(error);

            return;
        }

        // File extension check: acceptedFileTypes
        if (acceptedFileTypes.length > 0) {
            if (e.detail.valid === false) return;

            const ext = String(file.name).toLowerCase().split('.').pop();

            if (!acceptedFileTypes.includes(ext)) {
                e.detail.valid = false;
                e.detail.errors.push(
                    String(__('%file invalid file type .%ext'))
                        .replace(/%file/gi, file.name)
                        .replace(/%ext/gi, ext),
                );
            }
        }

        // File extension check: excludedFileTypes
        if (excludedFileTypes.length > 0) {
            if (e.detail.valid === false) return;

            const ext = String(file.name).toLowerCase().split('.').pop();

            if (excludedFileTypes.includes(ext)) {
                e.detail.valid = false;
                e.detail.errors.push(
                    String(__('%file invalid file type .%ext'))
                        .replace(/%file/gi, file.name)
                        .replace(/%ext/gi, ext),
                );
            }
        }

        // Max file size
        if (maxFileSize) {
            const max = maxFileSize * 1048576;
            if (file.size > max) {
                e.detail.valid = false;
                e.detail.errors.push(
                    String(__('maxFileSize %sizemb exceeded')).replace(
                        /%size/gi,
                        maxFileSize,
                    ),
                );
            }
        }
    };

    state.props = { onChange, ...props };
    state.value = state.get('value', []);

    state.extend('cx', cx);
    state.extend('initialized', isInit);
    state.extend('browse', browse);
    state.extend('clear', clear);
    state.extend('disable', disable);
    state.extend('enable', enable);
    state.extend('disabled', isDisabled);
    state.extend('enabled', isEnabled);
    state.extend('dispatch', dispatch);
    state.extend('rerender', forceRender);
    state.extend('removeFile', removeFiles);
    state.extend('removeFiles', removeFiles);
    state.extend('update', forceRender);

    useImperativeHandle(ref, () => state);

    useEffect(_onValueChange, [state.get('value')]);

    useEffect(_onPropsChange, [props]);

    useEffect(_onInit);

    useEffect(() => {
        if (state.get('count') !== count) state.set('count', count);
    }, [count]);

    return (
        <div
            style={style}
            onClick={_onClick}
            ref={(elm) => refs.set('container', elm)}
            className={cn(
                cx(),
                state.get('className'),
                { clickable: isClickable() },
                Dropfile.defaultProps.namespace,
            )}
        >
            <input
                multiple
                type='file'
                tabIndex={-1}
                onChange={_onInputChange}
                ref={(elm) => refs.set('input', elm)}
            />
            {prop('children')}
        </div>
    );
};

Dropfile = forwardRef(Dropfile);

Dropfile.propTypes = {
    acceptedFileTypes: PropTypes.array,
    className: PropTypes.string,
    clickable: PropTypes.bool,
    count: PropTypes.number,
    disabled: PropTypes.bool,
    excludedFileTypes: PropTypes.array,
    maxFiles: PropTypes.number,
    maxFileSize: PropTypes.number, // MB
    namespace: PropTypes.string,
    style: PropTypes.object,
    onCancel: PropTypes.func,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    onFileAdded: PropTypes.func,
    onFileRemoved: PropTypes.func,
    onInitialize: PropTypes.func,
};

Dropfile.defaultProps = {
    acceptedFileTypes: [],
    clickable: true,
    count: 0,
    disabled: false,
    excludedFileTypes: [],
    namespace: 'ar-dropfile',
    style: {},
    onCancel: _.noop,
    onChange: _.noop,
    onError: _.noop,
    onFileAdded: _.noop,
    onFileRemoved: _.noop,
    onInitialize: _.noop,
};

export { Dropfile, Dropfile as default };
