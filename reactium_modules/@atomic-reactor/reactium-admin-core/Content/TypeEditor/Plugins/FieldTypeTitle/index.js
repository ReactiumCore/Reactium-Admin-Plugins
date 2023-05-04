import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { __, useEventEffect, useRefs } from 'reactium-core/sdk';
import { Button, FormError, FormRegister, Icon } from 'reactium-ui';

export const slugify = str =>
    !str
        ? ''
        : String(str)
              .replace(/[^a-z0-9]/gi, '-')
              .toLowerCase();

export const Editor = ({ editor }) => {
    const refs = useRefs();

    const className = cn('form-group');
    const type = editor.get('params.type');

    const [autoGen, setAuthGen] = useState(editor.isNew);
    const [readOnly, setReadOnly] = useState(true);

    const titleProps = useMemo(
        () => ({
            type: 'text',
            name: 'title',
            placeholder: String(__('%type Title')).replace('%type', type),
        }),
        [type],
    );

    const slugProps = useMemo(
        () => ({
            readOnly,
            name: 'slug',
            type: 'text',
            placeholder: __('slug'),
        }),
        [readOnly],
    );

    const buttonStyle = useMemo(
        () => ({
            position: 'absolute',
            right: 0,
            bottom: 0,
            height: 32,
            width: 32,
            padding: 0,
        }),
        [],
    );

    const genSlug = useCallback(e => {
        const elm = refs.get('slug');
        if (!autoGen || !elm) return;
        const { value } = e.target;
        elm.value = slugify(value);
    }, []);

    const onBlur = useCallback(() => {
        const elm = refs.get('slug');
        if (!elm) return;
        let currentSlug = slugify(elm.value);
        elm.value = currentSlug;
        setReadOnly(true);
        if (String(currentSlug).length > 0 && autoGen !== false) {
            setAuthGen(false);
        }
    }, []);

    const onSlugChange = useCallback(e => {
        const value = e.target.value;
        e.target.value = slugify(value);
        const len = String(e.target.value).length;

        if (len < 1) setAuthGen(true);
        if (len > 0 && autoGen !== false) setAuthGen(false);
    }, []);

    const enable = useCallback(() => {
        const elm = refs.get('slug');
        if (!elm) return;
        setReadOnly(false);
        elm.select();
    }, []);

    const onValidate = useCallback(e => {
        const { slug, title } = e.values;

        if (!title) e.target.setError('title', __('enter the title'));
        if (!slug) e.target.setError('slug', __('enter a slug'));
    }, []);

    useEventEffect(editor.Form, {
        validate: onValidate,
    });

    return (
        <FormRegister>
            <div className={className}>
                <label>
                    <span className='sr-only'>{titleProps.placeholder}</span>
                    <input
                        {...titleProps}
                        className='input-lg'
                        data-focus
                        onChange={genSlug}
                        onBlur={onBlur}
                    />
                </label>
                <FormError name={titleProps.name} />
                <label>
                    <span className='sr-only'>{slugProps.placeholder}</span>
                    <Button
                        size='xs'
                        color='clear'
                        onClick={enable}
                        style={buttonStyle}>
                        <Icon name='Feather.Edit2' size={16} />
                    </Button>
                    <input
                        {...slugProps}
                        onBlur={onBlur}
                        className='input-sm'
                        onKeyUp={onSlugChange}
                        style={{ paddingRight: 32 }}
                        ref={elm => refs.set('slug', elm)}
                    />
                </label>
                <FormError name={slugProps.name} />
            </div>
        </FormRegister>
    );
};
