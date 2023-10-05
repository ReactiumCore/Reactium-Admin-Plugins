import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { UploaderPreview } from './UploaderPreview';
import { UploaderPlaceholder } from './UploaderPlaceholder';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
} from 'react';

import {
    __,
    useDispatcher,
    useRefs,
    useHookComponent,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

export const Uploader = forwardRef((props, ref) => {
    const refs = useRefs();

    const { namespace, value: defaultValue } = props;

    const state = useSyncState({
        errors: [],
        uploads: [],
        value: defaultValue || [],
        initialValue: defaultValue,
    });

    const cx = useMemo(() => Reactium.Utils.cxFactory(namespace), [namespace]);

    const clear = () => {
        // const dz = refs.get('dropzone');
        state.set({ uploads: null });
    };

    const dispatch = useDispatcher({ props, state });

    const { Dropzone } = useHookComponent('ReactiumUI');

    const empty = useMemo(() => {
        const value = state.get('value') || [];
        const uploads = state.get('uploads') || [];
        return Boolean(value.length < 1 && uploads.length < 1);
    }, [state.get('uploads'), state.get('value')]);

    const dzConfig = useMemo(
        () => ({
            clickable: empty,
            paramName: null,
            uploadMultiple: true,
            parallelUploads: op.get(props, 'parallelUploads', 1),
        }),
        [op.get(props, 'parallelUploads'), empty],
    );

    const onError = (e) => {};

    const onFileAdded = (e) => {
        if (!validateAddedFiles(e.added)) return;
        const dz = refs.get('dropzone');
        console.log(dz);

        const max = op.get(props, 'parallelUploads', 1);
        const uploads = max > 1 ? state.get('uploads') || [] : [];

        // Add to uploads array
        e.added.forEach((item) => uploads.push(item));

        state.set('uploads', uploads);

        dispatch('file-upload-added', { added: e.added, files: e.files });
    };

    const validateAddedFiles = (files) => {
        state.set('errors', []);
        const detail = { valid: true, errors: [] };

        const value = state.get('value') || [];

        const max = op.get(props, 'parallelUploads', 1);
        if (files.length > max || value.length >= max) {
            detail.valid = false;
            detail.errors.push(
                String('max uploads %max').replace(/%max/gi, max),
            );
        }

        const acceptedFileTypes = op.get(props, 'acceptedFileTypes', []);
        if (acceptedFileTypes.length > 0) {
            files.forEach((file) => {
                const ext = String(file.name).toLowerCase().split('.').pop();
                if (!acceptedFileTypes.includes(ext)) {
                    detail.valid = false;
                    detail.errors.push(
                        String('%file invalid file type (%exts)')
                            .replace(/%file/gi, file.name)
                            .replace(/%exts/gi, acceptedFileTypes.join(', ')),
                    );
                }
            });
        }

        dispatch('file-upload-validate', { detail });

        state.set('errors', detail.errors);
        return op.get(detail, 'valid');
    };

    state.refs = refs;

    state.value = state.get('value');

    state.extend('clear', clear);

    state.extend('dispatch', dispatch);

    useEffect(() => {
        state.value = state.get('value');
        dispatch('change', { value: state.value });
    }, [state.get('value')]);

    useEffect(() => {
        const errors = Array.from(state.get('errors') || []);
        const detail = { errors };
        if (errors.length > 0) {
            dispatch('error', { detail });
            state.set('errors', []);
        }
    }, [state.get('errors')]);

    useEffect(() => {
        if (state.get('initialValue') === props.value) return;
        state.value = props.value;
        state.set('value', props.value);
    }, [props.value]);

    useImperativeHandle(ref, () => state);

    useEffect(() => {
        const { dropzone: dz } = refs.get('dropzone');
        if (!dz) return;

        dz.options.clickable = empty;
        console.log(dz);
    }, [empty]);

    return (
        <div className={cn(cx(), { empty })}>
            <Dropzone
                config={dzConfig}
                onFileAdded={onFileAdded}
                ref={(elm) => refs.set('dropzone', elm)}
            >
                <UploaderPlaceholder
                    visible={empty}
                    namespace={props.namespace}
                    children={props.placeholder}
                    buttonLabel={props.buttonLabel}
                />
                <UploaderPreview
                    uploader={state}
                    files={state.get('value')}
                    uploads={state.get('uploads')}
                />
            </Dropzone>
        </div>
    );
});

Uploader.propTypes = {
    acceptedFileTypes: PropTypes.arrayOf(PropTypes.string),
    autoUpload: PropTypes.bool,
    buttonLabel: PropTypes.node,
    maxFiles: PropTypes.number,
    maxFileSize: PropTypes.number,
    namespace: PropTypes.string,
    parallelUploads: PropTypes.number,
    placeholder: PropTypes.node,
    value: PropTypes.array,
};

Uploader.defaultProps = {
    acceptedFileTypes: [],
    autoUpload: false,
    buttonLabel: PropTypes.node,
    maxFiles: 1,
    maxFileSize: 512,
    namespace: 'ar-field-type-file',
    parallelUploads: 1,
    placeholder: __('Drag & Drop File'),
    value: [],
};
