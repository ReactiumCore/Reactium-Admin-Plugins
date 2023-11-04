import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Dropfile } from './Dropfile';
import { UploaderPreview } from './UploaderPreview';
import { UploaderPlaceholder } from './UploaderPlaceholder';

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
} from 'react';

import Reactium, {
    __,
    useDispatcher,
    useRefs,
    useHookComponent,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

export const Uploader = forwardRef((props, ref) => {
    const {
        autoUpload,
        params,
        parallelUploads,
        serialize,
        fieldName,
        editor,
        value: defaultValue,
    } = props;

    const refs = useRefs();

    const state = useSyncState({
        errors: [],
        initialValue: defaultValue,
        uploads: [],
        uploading: null,
        value: _.chain([defaultValue || []])
            .flatten()
            .compact()
            .value(),
    });

    const clear = () => {
        state.set({ uploads: null });
        const dz = refs.get('dropzone');
        if (dz) dz.clear();
    };

    const browse = useCallback(() => {
        const dz = refs.get('dropzone');
        dz.browse();
        return state;
    }, []);

    const count = useCallback(() => {
        const value = state.get('value') || [];
        const uploads = state.get('uploads') || [];
        return value.length + uploads.length;
    }, []);

    const dispatch = useDispatcher({ props, state });

    const empty = useMemo(() => count() < 1);

    const getUploads = useCallback(
        () => Array.from(state.get('uploads') || []),
        [],
    );

    const getValue = useCallback(
        () =>
            Array.from(
                _.chain([state.get('value')])
                    .flatten()
                    .compact()
                    .value(),
            ),
        [],
    );

    const isUploading = useMemo(
        () => state.get('uploading'),
        [state.get('uploading')],
    );

    const move = useCallback(({ from, to }) => {
        const vals = Array.from(state.get('value'));

        const item = vals[from];

        vals.splice(from, 1);
        vals.splice(to, 0, item);

        vals.forEach((v, i) => {
            v.index = i;
            op.set(v, 'metadata.index', i);
        });

        state.value = vals;
        state.set('value', vals);
    }, []);

    const onError = useCallback((e) => {
        console.log(state.get('errors'), e);
    }, []);

    const onFileAdded = useCallback((e) => {
        if (!validateAddedFiles(e.added)) return;

        const max = op.get(props, 'maxFiles', 1);

        let uploads = max > 1 ? state.get('uploads') || [] : [];

        // Add to uploads array
        e.added.forEach((item) => {
            uploads.push(item);
        });

        uploads = _.compact(Array.from(uploads));
        if (uploads.length < 1) return;

        dispatch('file-upload-added', { added: e.added, files: e.files });

        state.set('uploads', uploads);
        if (autoUpload === true) return upload();
    }, []);

    const removeFile = useCallback((FILEID) => {
        const value = getValue();

        const idx = _.findIndex(value, (file) =>
            Boolean(op.get(file, 'metadata.ID') === FILEID),
        );

        if (idx > -1) {
            value.splice(idx, 1);
            state.set('value', value);
        }
        return state;
    }, []);

    const removeUpload = useCallback((upload) => {
        const uploads = state.get('uploads');
        const idx = _.findIndex(uploads, { ID: upload.ID });
        if (idx > -1) {
            uploads.splice(idx, 1);
            state.set('uploads', uploads);
        }

        const dz = refs.get('dropzone');
        if (dz) dz.removeFile(upload);
        return state;
    }, []);

    const _upload = () =>
        new Promise(async (resolve) => {
            if (isUploading) return;

            const previews = refs.get('previews');

            state.set('uploading', true, false);

            const output = [];

            let uploads = getUploads();

            while (uploads.length > 0) {
                let chunk = uploads.splice(0, parallelUploads);

                state.set('uploads', uploads, false);

                previews.uploading(_.pluck(chunk, 'ID'));

                let files = [];

                while (chunk.length > 0) {
                    const item = chunk.shift();
                    const name = serialize
                        ? [item.ID, String(item.name).split('.').pop()].join(
                              '.',
                          )
                        : item.name;

                    const file = new Reactium.File(name, item);

                    const meta = op.get(editor, 'Form.value.meta', {
                        file: {
                            [fieldName]: { [item.ID]: { meta: {}, tags: {} } },
                        },
                    });

                    op.set(meta, ['file', fieldName, item.ID, 'meta'], {
                        size: item.size,
                        fieldName: fieldName,
                        ID: item.ID,
                        name,
                    });

                    op.set(meta, ['file', fieldName, item.ID, 'tags'], {
                        fieldName: fieldName,
                        type: params.type,
                    });

                    files.push(
                        file.save().then((f) => {
                            removeUpload(item);

                            f.upload = item;

                            f.metadata = op.get(meta, [
                                'file',
                                fieldName,
                                item.ID,
                                'meta',
                            ]);
                            f.tags = op.get(meta, [
                                'file',
                                fieldName,
                                item.ID,
                                'tags',
                            ]);

                            dispatch('uploaded-file', { value: f, fieldName });

                            editor.setValue('meta', meta, false);

                            return f;
                        }),
                    );
                }

                files = await Promise.all(files);
                files.forEach((item) => output.push(item));

                uploads = getUploads();
            }

            state.set('uploading', false);

            const value = getValue();
            output.forEach((item) => value.push(item));
            state.value = value;
            state.set('value', value);

            resolve(value);
        });

    const upload = useMemo(() => _.debounce(_upload, 1000, false), []);

    const validateAddedFiles = (files) => {
        state.set('errors', []);
        const detail = { valid: true, errors: [], files };

        dispatch('file-upload-validate', { detail });

        state.set('errors', detail.errors);
        return op.get(detail, 'valid');
    };

    state.refs = refs;

    state.attributes = props;

    state.value = state.get('value');

    state.extend('move', move);

    state.extend('clear', clear);

    state.extend('count', count);

    state.extend('browse', browse);

    state.extend('dispatch', dispatch);

    state.extend('removeFile', removeFile);

    state.extend('empty', () => count() < 1);

    state.extend('removeUpload', removeUpload);

    state.extend('getAttribute', (attr) => op.get(props, attr));

    useEffect(
        (e) => {
            if (op.get(e, 'path')) return;
            state.value = getValue();
            dispatch('uploaded', { value: state.value, fieldName: fieldName });
        },
        [state.get('value')],
    );

    useEffect(() => {
        const errors = Array.from(state.get('errors') || []);
        const detail = { errors };
        if (errors.length > 0) {
            dispatch('error', { detail });
            state.set('errors', []);
        }
    }, [state.get('errors')]);

    useEffect(() => {
        state.addEventListener('error', onError);
        return () => {
            state.removeEventListener('error', onError);
        };
    }, [state]);

    useEffect(() => {
        if (!editor) return;
        const val = op.get(editor, `Form.value.${fieldName}`);
        if (_.isEqual(val, state.get('value'))) return;
        state.set('value', val);
    }, [op.get(editor, `Form.value.${fieldName}`)]);

    useImperativeHandle(ref, () => state);

    return (
        <Dropfile
            {...props}
            count={count()}
            className={cn({ empty })}
            onFileAdded={onFileAdded}
            value={state.get('value')}
            ref={(elm) => refs.set('dropzone', elm)}
        >
            <UploaderPlaceholder
                empty={empty}
                count={count()}
                uploader={state}
                maxFiles={props.maxFiles}
                namespace={props.namespace}
                children={props.placeholder}
                buttonLabel={props.buttonLabel}
            />
            <UploaderPreview
                count={count()}
                uploader={state}
                serialize={serialize}
                maxFiles={props.maxFiles}
                files={state.get('value')}
                uploads={state.get('uploads')}
                namespace={props.namespace + '-preview'}
                ref={(elm) => refs.set('previews', elm)}
            />
        </Dropfile>
    );
});

Uploader.propTypes = {
    acceptedFileTypes: PropTypes.arrayOf(PropTypes.string),
    autoUpload: PropTypes.bool,
    buttonLabel: PropTypes.node,
    clickable: PropTypes.bool,
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
    clickable: false,
    buttonLabel: PropTypes.node,
    maxFiles: 1,
    maxFileSize: 512,
    namespace: 'ar-field-type-file',
    parallelUploads: 2,
    placeholder: __('Drag & Drop File'),
    value: [],
};
