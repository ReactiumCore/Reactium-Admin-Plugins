import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import slugify from 'slugify';
import ENUMS from 'components/Admin/Media/enums';
import { Dialog, TagsInput } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
} from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const noop = () => {};

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

const Tags = forwardRef(({ value = {}, onChange = noop }, ref) => (
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
));

const Meta = ({ editor, props }) => {
    const tagsRef = useRef();

    const { directories, state = {} } = editor;

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
    //
    // const onFormChange = ({ value, e }) => {
    //     const { name } = e.target;
    //
    //     if (!name) return;
    //
    //     let val = name !== 'meta.tags' ? e.target.value : e.value;
    //
    //     if (name === 'filename') {
    //         val = String(slugify(val)).toLowerCase();
    //     }
    //
    //     if (name === 'directory') {
    //         let { directory, url } = value;
    //
    //         directory = `/${directory}/`;
    //
    //         if (url) {
    //             url = url.split(directory).join(`/${e.target.value}/`);
    //             op.set(value, 'url', url);
    //         }
    //     }
    //
    //     op.set(value, name, val);
    // };

    // Regsiter admin-media-change hook
    // useEffect(() => {
    //     const hooks = [
    //         Reactium.Hook.register('admin-media-change', onFormChange),
    //     ];
    //
    //     return () => {
    //         hooks.forEach(id => Reactium.Hook.unregister(id));
    //     };
    // });

    // Focus on error
    // useLayoutEffect(() => {
    //     focus();
    // }, [op.get(error, 'fields'), state.update]);
    //
    // useEffect(() => {
    //     if (!op.get(state, 'value') || !tagsRef.current) return;
    //     const tags = op.get(state, 'value.meta.tags', []);
    //     tagsRef.current.setState({ value: tags });
    // });

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
                    <Tags ref={tagsRef} value={state.value} />
                </div>
            </Dialog>
        </>
    );

    return render();
};

export { Meta, Meta as default };

// <Tags onChange={e => console.log(e)} ref={tagsRef} />
// <Directory
//     data={directories}
//     label='Directory:'
//     name='directory'
//     value={op.get(state, 'value.directory')}
// />
