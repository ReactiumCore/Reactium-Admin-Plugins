import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeRichText
 * -----------------------------------------------------------------------------
 */
export const FieldType = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-text'>
                <div className={'form-group'}>
                    <label>
                        <span className='sr-only'>{__('Default Value')}</span>
                        <input
                            type='text'
                            name='defaultValue'
                            placeholder={__('Default Value')}
                        />
                    </label>
                </div>
                <div className={'form-group'}>
                    <label>
                        <span className='sr-only'>{__('Placeholder')}</span>
                        <input
                            type='text'
                            name='placeholder'
                            placeholder={__('Placeholder')}
                        />
                    </label>
                </div>
                <div className={'form-group'}>
                    <label>
                        <span className='sr-only'>{__('Pattern')}</span>
                        <input
                            type='text'
                            name='pattern'
                            placeholder={__('Pattern')}
                        />
                    </label>
                </div>
            </div>
        </FieldTypeDialog>
    );
};

export const Editor = props => {
    const { defaultValue, editor, fieldName, pattern, placeholder } = props;
    const ElementDialog = useHookComponent('ElementDialog');

    const value = editor.value[fieldName];

    // Apply default value
    if (!value && defaultValue) editor.setValue({ [fieldName]: defaultValue });

    const inputProps = {
        defaultValue,
        name: fieldName,
        pattern,
        placeholder,
        type: 'text',
    };

    const { errors } = editor;
    const errorText = op.get(errors, [fieldName, 'message']);
    const className = cn('form-group', { error: !!errorText });
    const replacers = {
        '%fieldName': fieldName,
        '%type': editor.type,
        '%value': editor.value[fieldName],
    };

    return (
        <ElementDialog {...props}>
            <div className='p-xs-20'>
                <div className={className}>
                    <label>
                        <span className='sr-only'>
                            {placeholder || fieldName}
                        </span>
                        <input {...inputProps} />
                    </label>
                    {errorText && (
                        <small>
                            {editor.parseErrorMessage(errorText, replacers)}
                        </small>
                    )}
                </div>
            </div>
        </ElementDialog>
    );
};

export const QuickEditor = props => {
    return 'QuickEditor';
};
