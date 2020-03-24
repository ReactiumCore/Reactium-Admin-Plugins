import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import slugify from 'slugify';
import ENUMS from 'components/Admin/Media/enums';
import Reactium, { __ } from 'reactium-core/sdk';
import React, { forwardRef, useEffect, useRef } from 'react';
import { Dialog, TagsInput } from '@atomic-reactor/reactium-ui';

const noop = () => {};

const Meta = ({ editor, props }) => {
    const tagsRef = useRef();

    const { directories, state = {} } = editor;

    const applyWatch = fields => {
        fields.push('value.directory', 'value.url', 'value.filename');
    };

    const error = op.get(state, 'error', {});

    const file = op.get(state, 'file');

    const focus = () => {
        if (typeof window === 'undefined') return;

        const focus = op.get(error, 'focus');
        if (!focus) return;

        const elms = document.getElementsByName(focus);
        if (elms.length < 1) return;

        const elm = elms[0];
        if (!elm) return;

        elm.focus();
    };

    const formCls = field => {
        const errorFields = op.get(error, 'fields', []);
        return cn('form-group', { error: errorFields.includes(field) });
    };

    const ErrorMsg = ({ field }) => {
        const errorFields = op.get(error, 'fields', []);
        const idx = errorFields.indexOf(field);
        return idx > -1 ? (
            <small>{String(error.errors[idx]).replace('meta.', '')}</small>
        ) : null;
    };

    const _onChange = ({ changed }) => {
        // Update url on directory change
        if (op.get(changed, 'value.directory')) {
            const { current, previous } = changed.value.directory;
            let { url } = state.value;

            url = String(url)
                .split(`/${previous}/`)
                .join(`/${current}/`);

            const value = { ...state.value, url };

            editor.setState({ value });
        }

        // Update filename on url change
        if (op.get(changed, 'value.url')) {
            const { current } = changed.value.url;
            let { filename } = state.value;
            const newFilename = current.split('/').pop();
            if (filename === newFilename) return;

            const value = { ...state.value, filename: newFilename };
            editor.setState({ value });
        }

        // Update url on filename change
        if (op.get(changed, 'value.filename')) {
            const { current } = changed.value.filename;
            let { url } = state.value;

            const arr = url.split('/');
            arr.pop();

            url = arr.join('/') + '/' + current;
            if (state.value === url) return;

            const value = { ...state.value, url };
            editor.setState({ value });
        }
    };

    const render = () => (
        <>
            <Dialog
                header={{ title: __('File Info') }}
                pref='admin.dialog.media.editor.info'>
                <div className='p-xs-20'>
                    <input type='hidden' name='filename' />
                    <input type='hidden' name='objectId' />
                    <input type='hidden' name='meta.size' />
                    <Directory
                        data={directories}
                        label={__('Directory:')}
                        name='directory'
                    />
                    <div className={formCls('url')}>
                        <label>
                            {__('URL')}:
                            <input
                                autoComplete='off'
                                name='url'
                                spellCheck={false}
                                type='text'
                            />
                        </label>
                        <ErrorMsg field='url' />
                    </div>
                </div>
            </Dialog>
            <Dialog
                header={{ title: __('Meta') }}
                pref='admin.dialog.media.editor.meta'>
                <div className='p-xs-20'>
                    <div className={formCls('meta.title')}>
                        <label>
                            {__('Title')}:
                            <input
                                autoComplete='off'
                                name='meta.title'
                                type='text'
                            />
                        </label>
                        <ErrorMsg field='meta.title' />
                    </div>
                    <div className={formCls('meta.description')}>
                        <label>
                            {__('Description')}:
                            <textarea
                                autoComplete='off'
                                name='meta.description'
                                rows={4}
                            />
                        </label>
                        <ErrorMsg field='meta.description' />
                    </div>
                    <Tags editor={editor} />
                </div>
            </Dialog>
        </>
    );

    useEffect(() => {
        Reactium.Hook.register('media-watch-fields', applyWatch);
        editor.addEventListener('DIRTY', _onChange);

        return () => {
            editor.removeEventListener('DIRTY', _onChange);
            Reactium.Hook.unregister('media-watch-fields', applyWatch);
        };
    });

    return render();
};

const Directory = ({ data, label, name }) => (
    <div className='form-group'>
        <label>
            {label}
            <select name={name}>
                {data &&
                    data.map((item, i) => (
                        <option key={`${name}-${i}`}>{item}</option>
                    ))}
            </select>
        </label>
    </div>
);

const Tags = ({ editor }) => {
    const ref = useRef();
    const { setState = noop, state = {} } = editor;
    const { value = {} } = state;

    const onChange = e => {
        const newValue = { ...value };
        op.set(newValue, 'meta.tags', e.value);
        setState(newValue);
    };

    return (
        <>
            <div className='form-group mb-xs-0'>
                <label>{__('Tags')}:</label>
            </div>
            <TagsInput
                ref={ref}
                placeholder={__('Add tag')}
                name='meta.tags'
                onChange={e => onChange(e)}
                value={op.get(value, 'meta.tags')}
            />
        </>
    );
};

export { Meta, Meta as default };
