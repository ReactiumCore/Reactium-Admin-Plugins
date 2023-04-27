import cn from 'classnames';
import React, { useState } from 'react';
import { __, useHookComponent, useRefs } from 'reactium-core/sdk';

export const slugify = str =>
    !str
        ? ''
        : String(str)
              .replace(/[^a-z0-9]/gi, '-')
              .toLowerCase();

export default props => {
    const refs = useRefs();

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const { editor, errorText } = props;
    const { cx, isNew, properCase, type } = editor;
    const className = cn('form-group', { error: !!errorText });

    const [autoGen, setAuthGen] = useState(isNew());
    const [readOnly, setReadOnly] = useState(true);

    const titlePlaceholder = String(__('%type Title')).replace('%type', type);

    const titleProps = {
        name: 'title',
        placeholder: properCase(titlePlaceholder),
        type: 'text',
    };
    const slugProps = {
        name: 'slug',
        placeholder: __('slug'),
        readOnly,
        type: 'text',
    };

    const genSlug = e => {
        const elm = refs.get('slug');
        if (!autoGen || !elm) return;
        const { value } = e.target;
        elm.value = slugify(value);
    };

    const onBlur = () => {
        const elm = refs.get('slug');
        if (!elm) return;
        let currentSlug = slugify(elm.value);
        elm.value = currentSlug;
        setReadOnly(true);
        if (String(currentSlug).length > 0 && autoGen !== false) {
            setAuthGen(false);
        }
    };

    const onSlugChange = e => {
        const value = e.target.value;
        e.target.value = slugify(value);
        const len = String(e.target.value).length;

        if (len < 1) setAuthGen(true);
        if (len > 0 && autoGen !== false) setAuthGen(false);
    };

    const enable = () => {
        const elm = refs.get('slug');
        if (!elm) return;
        setReadOnly(false);
        elm.select();
    };

    const buttonStyle = {
        position: 'absolute',
        right: 0,
        bottom: 0,
        height: 32,
        width: 32,
        padding: 0,
    };

    return (
        <div className={cx('editor-region', 'editor-region-slug')}>
            <div className={cx('element', 'element-slug')}>
                <div className={className}>
                    <label>
                        <span className='sr-only'>
                            {titleProps.placeholder}
                        </span>
                        <input
                            {...titleProps}
                            className='input-lg'
                            data-focus
                            onChange={genSlug}
                            onBlur={onBlur}
                        />
                    </label>
                    <label>
                        <span className='sr-only'>{slugProps.placeholder}</span>
                        <input
                            {...slugProps}
                            onBlur={onBlur}
                            className='input-sm'
                            onKeyUp={onSlugChange}
                            style={{ paddingRight: 32 }}
                            ref={elm => refs.set('slug', elm)}
                        />
                        <Button
                            size='xs'
                            color='clear'
                            onClick={enable}
                            style={buttonStyle}>
                            <Icon name='Feather.Edit2' size={16} />
                        </Button>
                    </label>
                    {errorText && <small>{errorText}</small>}
                </div>
            </div>
        </div>
    );
};
