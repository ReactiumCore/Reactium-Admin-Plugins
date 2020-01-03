import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import slugify from 'slugify';
import ENUMS from 'components/Admin/Media/enums';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';

import React, {
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
} from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

export default props => {
    const Directory = useHookComponent('MediaEditorDirectory');
    const Tags = useHookComponent('MediaEditorTags');

    const tagsRef = useRef();

    const { file, directories, onChange, state = { value: {} } } = props;

    const { directory } = state.value;

    const { error = { fields: [], errors: [] } } = state;

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
        return cn({ 'form-group': true, error: errorFields.includes(field) });
    };

    const ErrorMsg = ({ field }) => {
        const errorFields = op.get(error, 'fields', []);
        const idx = errorFields.indexOf(field);
        return idx > -1 ? (
            <small>{String(error.errors[idx]).replace('meta.', '')}</small>
        ) : null;
    };

    const onFormChange = ({ value, e }) => {
        const { name } = e.target;

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
    };

    const onValuesChange = ({ value }) => {
        if (tagsRef.current) {
            const tags = op.get(value, 'meta.tags');
            if (tags) tagsRef.current.setState({ value: tags });
        }
    };

    // Regsiter admin-media-change hook
    useEffect(() => {
        const hooks = [
            Reactium.Hook.register('admin-media-change', onFormChange),
            Reactium.Hook.register('admin-media-value-change', onValuesChange),
        ];

        return () => {
            hooks.forEach(id => Reactium.Hook.unregister(id));
        };
    });

    // Focus on error
    useLayoutEffect(() => {
        focus();
    }, [op.get(error, 'fields'), state.update]);

    return (
        <>
            <input type='hidden' name='filename' />
            <input type='hidden' name='objectId' />
            <input type='hidden' name='meta.size' />
            <Directory
                data={directories}
                label='Directory:'
                name='directory'
                value={directory}
            />
            {!file && (
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
            )}
            <div className={formCls('meta.title')}>
                <label>
                    {__('Title')}:
                    <input autoComplete='off' name='meta.title' type='text' />
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
            <Tags onChange={e => onChange(e)} ref={tagsRef} />
        </>
    );
};
