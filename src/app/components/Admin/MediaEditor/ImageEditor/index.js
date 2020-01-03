import op from 'object-path';
import slugify from 'slugify';
import ENUMS from 'components/Admin/Media/enums';
import { Scrollbars } from 'react-custom-scrollbars';
import React, { forwardRef, useEffect, useRef } from 'react';
import { Button, Dropzone, WebForm } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';

let ImageEditor = ({ children, ...props }, ref) => {
    const Blocker = useHookComponent('Blocker');
    const Zone = useHookComponent('Zone');

    let {
        cname,
        cx,
        data,
        directories,
        onChange,
        onError,
        onSubmit,
        state = {},
        setState,
    } = useHandle('MediaEditor');

    // Refs
    const dropzoneRef = useRef();
    const formRef = useRef();
    const imageRef = useRef();

    const dropzoneProps = {
        config: {
            chunking: false,
            clickable: true,
            maxFiles: 1,
            maxFilesize: ENUMS.MAX_SIZE / 1048576,
            previewTemplate: '<span />',
        },
        debug: false,
    };

    const previewStyle = () => {
        return state.file
            ? { maxWidth: state.file.width, maxHeight: state.file.height }
            : state.currentFile
            ? {
                  maxWidth: state.currentFile.width,
                  maxHeight: state.currentFile.height,
              }
            : {};
    };

    const onBrowse = () => dropzoneRef.current.browseFiles();

    const onCancel = () => {
        const { initialData, status, value = {} } = state;

        if (status === ENUMS.STATUS.PROCESSING) return;

        op.set(value, 'filename', op.get(initialData, 'filename'));
        op.set(value, 'meta.size', op.get(initialData, 'meta.size'));

        setState({ file: undefined, value });
    };

    const onFileAdded = async e => {
        const { status } = state;

        if (status === ENUMS.STATUS.PROCESSING) return;

        const file = e.added[0];

        const { size } = file;

        if (size > ENUMS.MAX_SIZE) return;

        const ext = String(
            String(file.name)
                .split('.')
                .pop(),
        ).toUpperCase();

        if (!ENUMS.TYPE.IMAGE.includes(ext)) return;

        const reader = new FileReader();
        reader.onload = () => {
            const { value = {} } = state;

            op.set(value, 'filename', String(slugify(file.name)).toLowerCase());
            op.set(value, 'meta.size', file.size);

            if (imageRef.current) {
                imageRef.current.style.maxWidth = file.width;
                imageRef.current.style.maxHeight = file.height;
            }

            setState({ file, value, update: Date.now() });
        };
        reader.readAsText(file);
    };

    const onFileError = e => {
        let { message } = e;
        message = String(message)
            .toLowerCase()
            .includes('file is too big')
            ? `Max file size ${ENUMS.MAX_SIZE / 1048576}mb`
            : message;

        onError({ message });
    };

    const onInputError = e => {
        const { errors = [], fields = [] } = e.errors;
        const focus = fields.length > 0 ? fields[0] : null;
        onError({ errors, fields, focus, message: null });
    };

    // Initial image load
    useEffect(() => {
        if (!state.currentFile && state.value) {
            const img = new Image();
            img.onload = () => {
                const currentFile = {
                    dataURL: state.value.url,
                    width: img.width,
                    height: img.height,
                    name: state.value.filename,
                };

                setState({ currentFile, update: Date.now() });
            };
            img.src = state.value.url;
        }
    }, [state.currentFile, state.value]);

    // Form values change
    useEffect(() => {
        const { value } = state;

        if (formRef.current) {
            formRef.current.update(value);
        }
    }, [state, formRef.current]);

    // Renderer
    const render = () => {
        const { file, files, status, value } = state;

        return !value ? null : (
            <WebForm
                onChange={e => onChange(e)}
                onError={e => onInputError(e)}
                onSubmit={e => onSubmit(e)}
                ref={formRef}
                showError={false}
                value={value}>
                <Dropzone
                    {...dropzoneProps}
                    className={cname()}
                    files={files}
                    onError={e => onFileError(e)}
                    onFileAdded={e => onFileAdded(e)}
                    ref={dropzoneRef}>
                    <div className={cx('dropzone')}>
                        {file && (
                            <>
                                <div className='mb-xs-12 small'>
                                    {op.get(state, 'value.filename')}
                                </div>
                                <span className={cx('image')}>
                                    <img
                                        ref={imageRef}
                                        src={file.dataURL}
                                        style={previewStyle()}
                                    />
                                    <Button
                                        appearance='pill'
                                        color='danger'
                                        className='primary'
                                        onClick={() => onCancel()}
                                        size='sm'>
                                        {__('Cancel')}
                                    </Button>
                                </span>
                            </>
                        )}
                        {!state.file && state.currentFile && (
                            <>
                                <div className='mb-xs-12 small'>
                                    {op.get(state, 'value.filename')}
                                </div>
                                <span className={cx('image')}>
                                    <img
                                        src={state.currentFile.dataURL}
                                        style={previewStyle()}
                                    />
                                    <Button
                                        appearance='pill'
                                        color='primary'
                                        className='primary'
                                        onClick={() => onBrowse()}
                                        size='sm'>
                                        {__('Select Image')}
                                    </Button>
                                </span>
                            </>
                        )}
                    </div>
                    <div className={cx('meta')}>
                        <div>
                            <Scrollbars>
                                <div className='p-xs-24'>
                                    <Zone zone='admin-media-editor-meta' />
                                    <Zone zone='admin-media-editor-meta-image' />
                                </div>
                            </Scrollbars>
                        </div>
                        <div>
                            <Button
                                block
                                disabled={status === ENUMS.STATUS.PROCESSING}
                                size='md'
                                type='submit'>
                                {status === ENUMS.STATUS.PROCESSING
                                    ? __('Saving Image...')
                                    : __('Save Image')}
                            </Button>
                        </div>
                    </div>
                </Dropzone>
                {status === ENUMS.STATUS.PROCESSING && <Blocker />}
            </WebForm>
        );
    };

    // Render
    return render();
};

ImageEditor = forwardRef(ImageEditor);

export { ImageEditor as default };
