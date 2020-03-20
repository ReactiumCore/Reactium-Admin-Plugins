import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';
import { Dialog } from '@atomic-reactor/reactium-ui';

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

    const editorValue = op.get(editor, 'value', {});

    const value = editorValue[fieldName];

    // Apply default value
    //if (!value && defaultValue) editor.setValue({ [fieldName]: defaultValue });

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
        '%value': editorValue[fieldName],
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
    return 'Text QuickEditor';
};

export const Comparison = props => {
    const field = op.get(props, 'field', {});
    const value = op.get(props, 'value');
    const { fieldName: title } = field;

    return (
        <Dialog header={{ title }} collapsible={false}>
            <div className='p-xs-20' style={{ minHeight: '60px' }}>
                {value ? value : null}
            </div>
        </Dialog>
    );
};
