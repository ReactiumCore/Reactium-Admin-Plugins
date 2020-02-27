import cn from 'classnames';
import React, { useRef, useState, useEffect } from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

export const slugify = name => {
    if (!name) return '';

    return require('slugify')(name, {
        replacement: '-', // replace spaces with replacement
        remove: /[^A-Za-z0-9-\s]/g, // regex to remove characters
        lower: true, // result in lower case
    });
};

export default props => {
    const { editor, errorText } = props;
    const { cx, properCase, type } = editor;
    const className = cn('form-group', { error: !!errorText });

    const titlePlaceholder = String(__('%type Title')).replace('%type', type);

    const titleProps = {
        name: 'title',
        //pattern: '[A-Za-z0-9\-\s]',
        placeholder: properCase(titlePlaceholder),
        type: 'text',
    };
    const slugProps = {
        name: 'slug',
        //pattern: '[A-Za-z0-9\-]',
        placeholder: __('slug'),
        type: 'text',
    };

    return (
        <div className={cn(cx('editor-region'), cx('editor-region-slug'))}>
            <div className={cn(cx('element'), cx('element-slug'))}>
                <div className={className}>
                    <label>
                        <span className='sr-only'>
                            {titleProps.placeholder}
                        </span>
                        <input {...titleProps} className='input-lg' />
                    </label>
                    <label>
                        <span className='sr-only'>{slugProps.placeholder}</span>
                        <input {...slugProps} className='input-sm' />
                    </label>
                    {errorText && <small>{errorText}</small>}
                </div>
            </div>
        </div>
    );
};
