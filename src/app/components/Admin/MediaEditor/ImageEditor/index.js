import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import slugify from 'slugify';
import PropTypes from 'prop-types';
import ENUMS from 'components/Admin/Media/enums';
import { Scrollbars } from 'react-custom-scrollbars';
import React, { forwardRef, useEffect, useRef } from 'react';

import Reactium, {
    useHandle,
    useHookComponent,
    useSelect,
} from 'reactium-core/sdk';

import { Button, Dropzone, TagsInput } from '@atomic-reactor/reactium-ui';
import WebForm from 'components/Reactium-UI/WebForm';

const noop = () => {};

let ImageEditor = ({ children, ...props }, ref) => {
    const Directory = useHookComponent('MediaEditorDirectory');

    const Tags = useHookComponent('MediaEditorTags');

    const { cname, cx, data, directories, state, setState } = useHandle(
        'MediaEditor',
    );

    // Refs
    const dropzoneRef = useRef();

    const formRef = useRef();

    const tagsRef = useRef();

    const dropzoneProps = {
        config: {
            chunking: false,
            clickable: false,
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

    const onCancel = () => {
        const { value = {} } = state;

        op.set(value, 'filename', op.get(data, 'filename'));
        op.set(value, 'meta.size', op.get(data, 'meta.size'));

        setState({ file: undefined, value });
    };

    const onChange = e => {
        const { name } = e.target;
        const { value } = state;

        if (!name) return;

        const val = name !== 'meta.tags' ? e.target.value : e.value;

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

            op.set(value, 'filename', file.name);
            op.set(value, 'meta.size', file.size);

            setState({ file, value, updated: Date.now() });
        };
        reader.readAsText(file);
    };

    const onSubmit = e => {
        const { value } = state;
        delete value.type;
        console.log(value);
    };

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

    // Renderer
    const render = () => {
        return !state.value ? null : (
            <WebForm
                onChange={e => onChange(e)}
                onSubmit={onSubmit}
                ref={formRef}
                value={state.value}>
                <Dropzone
                    {...dropzoneProps}
                    className={cname()}
                    files={state.files}
                    onError={e => onFileError(e)}
                    onFileAdded={e => onFileAdded(e)}
                    ref={dropzoneRef}>
                    <div className={cx('dropzone')}>
                        {state.file && (
                            <>
                                <div className='mb-xs-12 small'>
                                    {op.get(state, 'value.filename')}
                                </div>
                                <span className={cx('image')}>
                                    <img
                                        src={state.file.dataURL}
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
                                </span>
                            </>
                        )}
                    </div>
                    <div className={cx('meta')}>
                        <div>
                            <Scrollbars>
                                <div className='p-xs-24'>
                                    <input name='meta.size' type='hidden' />
                                    <Directory data={directories} />
                                    <div className='form-group'>
                                        <label>
                                            URL:
                                            <input name='url' />
                                        </label>
                                    </div>
                                    <div className='form-group'>
                                        <label>
                                            Title:
                                            <input name='meta.title' />
                                        </label>
                                    </div>
                                    <div className='form-group'>
                                        <label>
                                            Description:
                                            <textarea
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
                            <Button block size='md' type='submit'>
                                Save Image
                            </Button>
                        </div>
                    </div>
                </Dropzone>
            </WebForm>
        );
    };

    // Render
    return render();
};

ImageEditor = forwardRef(ImageEditor);

export { ImageEditor as default };
