import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import slugify from 'slugify';
import PropTypes from 'prop-types';
import ENUMS from 'components/Admin/Media/enums';
import { Scrollbars } from 'react-custom-scrollbars';
import React, { forwardRef, useEffect, useRef } from 'react';

import useWorker from 'components/Admin/MediaEditor/_utils/useWorker';

import Reactium, {
    useHandle,
    useHookComponent,
    useSelect,
} from 'reactium-core/sdk';

import { Button, Dropzone, WebForm } from '@atomic-reactor/reactium-ui';

const noop = () => {};

let ImageEditor = ({ children, ...props }, ref) => {
    const Blocker = useHookComponent('Blocker');
    const Directory = useHookComponent('MediaEditorDirectory');
    const Permissions = useHookComponent('MediaEditorPermissions');
    const Tags = useHookComponent('MediaEditorTags');

    const { Toast } = useHandle('AdminTools');

    let { cname, cx, data, directories, state, setState } = useHandle(
        'MediaEditor',
    );

    // Refs
    const dropzoneRef = useRef();
    const formRef = useRef();
    const tagsRef = useRef();

    const dropzoneProps = {
        config: {
            chunking: false,
            clickable: true,
            previewTemplate: '<span />',
        },
        debug: false,
    };

    const imageStyle = () => {
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

    const onChange = e => {
        const { name } = e.target;
        const { value } = state;

        if (!name) return;

        let val = name !== 'meta.tags' ? e.target.value : e.value;

        if (name === 'filename') {
            val = String(slugify(val)).toLowerCase();
        }

        if (name === 'directory') {
            let { directory, url } = value;

            directory = `/${directory}/`;

            if (url) {
                url = url.split(directory).join(`/${e.target.value}/`);
                op.set(value, 'url', url);
            }
        }

        op.set(value, name, val);

        setState({ value });
    };

    const onFileError = e => {
        console.log(e);
    };

    const onFileAdded = async e => {
        const { status } = state;

        if (status === ENUMS.STATUS.PROCESSING) return;

        const file = e.added[0];
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

            setState({ file, value, updated: Date.now() });
        };
        reader.readAsText(file);
    };

    const onSubmit = async e => {
        const { file, status, value } = state;

        if (status === ENUMS.STATUS.PROCESSING) return;

        delete value.type;
        delete value.file;
        delete value.createdAt;
        delete value.updatedAt;
        delete value.fetched;
        delete value.user;
        delete value.uuid;
        delete value.capabilities;

        setState({ progress: 0, status: ENUMS.STATUS.PROCESSING });

        value.filename = String(slugify(value.filename)).toLowerCase();

        Reactium.Media.update({ file, ...value });
    };

    const onWorkerMessage = e => {
        const { type, params } = e;

        switch (type) {
            case 'status':
                setState(params);
                break;
        }
    };

    // Worker status update
    useEffect(() => {
        const { result, status } = state;

        switch (status) {
            case ENUMS.STATUS.COMPLETE:
                setState({
                    status: ENUMS.STATUS.READY,
                    initialData: result,
                    result: undefined,
                    file: undefined,
                });
                break;
        }
    }, [state.status]);

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

                setState({ currentFile, updated: Date.now() });
            };
            img.src = state.value.url;
        }
    }, [state.currentFile, state.value]);

    // Value changes
    useEffect(() => {
        const { value } = state;

        if (tagsRef.current) {
            const tags = op.get(value, 'meta.tags');
            if (tags) tagsRef.current.setState({ value: tags });
        }

        if (formRef.current) {
            formRef.current.update(value);
        }
    }, [state]);

    // Register Hook
    Reactium.Hook.register('media-worker', e => onWorkerMessage(e));

    // Renderer
    const render = () => {
        const { file, files, status, value } = state;

        return !value ? null : (
            <WebForm
                onChange={e => onChange(e)}
                onSubmit={onSubmit}
                ref={formRef}
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
                                        src={file.dataURL}
                                        style={imageStyle()}
                                    />
                                    <Button
                                        appearance='pill'
                                        color='danger'
                                        onClick={() => onCancel()}
                                        size='sm'>
                                        Cancel
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
                                        style={imageStyle()}
                                    />
                                    <Button
                                        appearance='pill'
                                        color='primary'
                                        onClick={() => onBrowse()}
                                        size='sm'>
                                        Select Image
                                    </Button>
                                </span>
                            </>
                        )}
                    </div>
                    <div className={cx('meta')}>
                        <div>
                            <Scrollbars>
                                <div className='p-xs-24'>
                                    <input type='hidden' name='filename' />
                                    <input type='hidden' name='objectId' />
                                    <input type='hidden' name='meta.size' />
                                    <Directory
                                        data={directories}
                                        label='Directory:'
                                        name='directory'
                                        value={state.value.directory}
                                    />
                                    {!state.file && (
                                        <div className='form-group'>
                                            <label>
                                                URL:
                                                <input
                                                    autoComplete='off'
                                                    name='url'
                                                    spellCheck={false}
                                                    type='text'
                                                />
                                            </label>
                                        </div>
                                    )}
                                    <div className='form-group'>
                                        <label>
                                            Title:
                                            <input
                                                autoComplete='off'
                                                name='meta.title'
                                                type='text'
                                            />
                                        </label>
                                    </div>
                                    <div className='form-group'>
                                        <label>
                                            Description:
                                            <textarea
                                                autoComplete='off'
                                                name='meta.description'
                                                rows={4}
                                            />
                                        </label>
                                    </div>
                                    <Tags
                                        onChange={e => onChange(e)}
                                        ref={tagsRef}
                                    />
                                </div>
                            </Scrollbars>
                        </div>
                        <div>
                            <Button
                                block
                                size='md'
                                type='submit'
                                disabled={status === ENUMS.STATUS.PROCESSING}>
                                {status === ENUMS.STATUS.PROCESSING
                                    ? 'Saving Image...'
                                    : 'Save Image'}
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
