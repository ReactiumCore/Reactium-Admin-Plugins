import op from 'object-path';
import slugify from 'slugify';
import ENUMS from 'components/Admin/Media/enums';
import { Scrollbars } from 'react-custom-scrollbars';
import React, { forwardRef, useEffect, useRef } from 'react';
import Rocket from 'components/Admin/Media/MediaEditor/VideoEditor/Rocket';
import { Button, Icon, Dropzone, WebForm } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';

export default ({ children, ...props }) => {
    const Blocker = useHookComponent('Blocker');
    const Zone = useHookComponent('Zone');

    let {
        cname,
        cx,
        data,
        directories,
        isBusy,
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

        if (isBusy()) return;

        op.set(value, 'filename', op.get(initialData, 'filename'));
        op.set(value, 'meta.size', op.get(initialData, 'meta.size'));
        op.set(value, 'ext', String(op.get(initialData, 'ext')).toUpperCase());

        const currentFile = {
            dataURL: Reactium.Media.url(initialData.file),
            name: value.filename,
            ext: value.ext,
        };

        setState({ currentFile, file: undefined, value, update: Date.now() });
    };

    const onFileAdded = async e => {
        const { value, status } = state;

        if (isBusy()) return;

        const file = e.added[0];

        const { size } = file;

        if (size > ENUMS.MAX_SIZE) return;

        const ext = String(
            String(file.name)
                .split('.')
                .pop(),
        ).toUpperCase();

        if (ENUMS.TYPE.AUDIO.includes(ext)) return;
        if (ENUMS.TYPE.IMAGE.includes(ext)) return;
        if (ENUMS.TYPE.VIDEO.includes(ext)) return;

        op.set(value, 'filename', String(slugify(file.name)).toLowerCase());
        op.set(value, 'meta.size', file.size);
        op.set(value, 'ext', ext);

        dropzoneRef.current.dropzone.removeAllFiles();
        setState({ currentFile: undefined, file, update: Date.now(), value });
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

    // Initial video load
    useEffect(() => {
        if (!state.file && !state.currentFile && state.value) {
            const currentFile = {
                dataURL: Reactium.Media.url(state.value.file),
                name: state.value.filename,
                ext: state.value.ext,
            };

            setState({ currentFile, update: Date.now() });
        }
    }, [state.currentFile, state.value, state.update]);

    // Form values change
    useEffect(() => {
        const { value } = state;

        if (formRef.current) {
            formRef.current.update(value);
        }
    }, [state, formRef.current]);

    // Renderer
    const render = () => {
        const { currentFile, file, files, status, thumbnail, value } = state;
        const busy = isBusy();

        return !value ? null : (
            <WebForm
                onChange={e => onChange(e)}
                onError={e => onInputError(e)}
                onSubmit={e => onSubmit(e)}
                ref={formRef}
                required={['url']}
                showError={false}
                value={value}>
                <Dropzone
                    {...dropzoneProps}
                    className={cname()}
                    files={{}}
                    onError={e => onFileError(e)}
                    onFileAdded={e => onFileAdded(e)}
                    ref={dropzoneRef}>
                    <div className={cx('dropzone')}>
                        {file && (
                            <>
                                <div className={cx('graphic')}>
                                    <Rocket />
                                </div>
                                <div className='mb-xs-20 small'>
                                    {file.name}
                                </div>
                                <div>
                                    <Button
                                        disabled={busy}
                                        size='md'
                                        color='danger'
                                        appearance='pill'
                                        onClick={() => onCancel()}
                                        type='button'>
                                        {busy
                                            ? __('Uploading File...')
                                            : __('Cancel Upload')}
                                    </Button>
                                </div>
                                <Zone zone='admin-media-editor-file' />
                            </>
                        )}
                        {!file && currentFile && (
                            <>
                                <Icon
                                    name='Linear.FileEmpty'
                                    size={128}
                                    className='mt-xs-16 mt-sm-40'
                                />
                                <div className='my-xs-20 small'>
                                    {op.get(state, 'value.filename')}
                                </div>
                                <Button
                                    appearance='pill'
                                    color='primary'
                                    className='primary'
                                    onClick={() => onBrowse()}
                                    size='sm'>
                                    {__('Select File')}
                                </Button>
                                <Zone zone='admin-media-editor-file' />
                            </>
                        )}
                    </div>
                    <div className={cx('meta')}>
                        <div>
                            <Scrollbars>
                                <Zone zone='admin-media-editor-meta-file' />
                                <Zone zone='admin-media-editor-meta' />
                            </Scrollbars>
                        </div>
                        <div>
                            <Button
                                block
                                disabled={busy}
                                size='md'
                                type='submit'>
                                {busy ? __('Saving File...') : __('Save File')}
                            </Button>
                        </div>
                    </div>
                </Dropzone>
                {busy && <Blocker />}
            </WebForm>
        );
    };

    // Render
    return render();
};
