import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';
import { Checkbox, Dialog } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeText
 * -----------------------------------------------------------------------------
 */
export const FieldType = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-text'>
                <div className='input-group'>
                    <label className='default-value'>
                        <span className='sr-only'>{__('Default Value')}</span>
                        <input
                            type='text'
                            name='defaultValue'
                            placeholder={__('Default Value')}
                        />
                    </label>
                </div>
                <div className='input-group'>
                    <label className='placeholder'>
                        <span className='sr-only'>{__('Placeholder')}</span>
                        <input
                            type='text'
                            name='placeholder'
                            placeholder={__('Placeholder')}
                        />
                    </label>
                </div>
                <div className='input-group'>
                    <label className='pattern'>
                        <span className='sr-only'>{__('Pattern')}</span>
                        <input
                            type='text'
                            name='pattern'
                            placeholder={__('Pattern')}
                        />
                    </label>
                </div>
                <div className='input-group'>
                    <label className='min-max'>
                        <span className='sr-only'>{__('Min Characters')}</span>
                        <input
                            type='number'
                            name='min'
                            placeholder={__('Min Characters')}
                        />
                    </label>
                    <label className='min-max'>
                        <span className='sr-only'>{__('Max Characters')}</span>
                        <input
                            type='number'
                            name='max'
                            placeholder={__('Max Characters')}
                        />
                    </label>
                    <label className='min-max'>
                        <span className='sr-only'>{__('Rows')}</span>
                        <input
                            type='number'
                            name='rows'
                            placeholder={__('Rows')}
                        />
                    </label>
                    <div className='checks pl-xs-0 pl-md-20'>
                        <Checkbox
                            name='multiline'
                            label={__('Multiline')}
                            labelAlign='right'
                            value={true}
                        />

                        <Checkbox
                            name='required'
                            label={__('Required')}
                            labelAlign='right'
                            value={true}
                        />
                    </div>
                </div>
            </div>
        </FieldTypeDialog>
    );
};

export const Editor = props => {
    const {
        defaultValue,
        editor,
        fieldName,
        max,
        min,
        multiline,
        pattern,
        placeholder,
        required,
        rows = 2,
    } = props;

    const inputRef = useRef();
    const ElementDialog = useHookComponent('ElementDialog');

    const inputProps = {
        defaultValue,
        maxLength: max,
        minLength: min,
        name: fieldName,
        pattern,
        placeholder,
        ref: inputRef,
    };

    if (multiline === true) op.set(inputProps, 'rows', rows);

    const { errors } = editor;
    const errorText = op.get(errors, [fieldName, 'message']);
    const className = cn('form-group', { error: !!errorText });
    const replacers = {
        '%fieldName': fieldName,
        '%max': max,
        '%min': min,
    };

    const validate = ({ context, value }) => {
        const v = value[fieldName];

        const err = {
            field: fieldName,
            focus: inputRef.current,
            message: null,
            value: v,
        };

        if (required === true && !v) {
            err.message = __('%fieldName is required');
        }

        if (v && min) {
            if (String(v).length < Number(min)) {
                err.message = __('%fieldName minimum character count is %min');
            }
        }

        if (v && max) {
            if (String(v).length > Number(max)) {
                err.message = __('%fieldName maximum character count is %max');
            }
        }

        if (err.message !== null) {
            err.message = editor.parseErrorMessage(err.message, replacers);
            context.error[fieldName] = err;
            context.valid = false;
        }

        return context;
    };

    const onSave = e => {
        let val = e.value[fieldName];

        val = _.isString(val) ? val : String(val);

        op.set(e.value, fieldName, val);

        console.log(e.value);
    };

    useEffect(() => {
        editor.addEventListener('validate', validate);
        editor.addEventListener('before-save', onSave);

        return () => {
            editor.removeEventListener('validate', validate);
            editor.removeEventListener('before-save', onSave);
        };
    }, [editor]);

    return (
        <ElementDialog {...props}>
            <div className='p-xs-20'>
                <div className={className}>
                    <label>
                        <span className='sr-only'>
                            {placeholder || fieldName}
                        </span>
                        {multiline === true ? (
                            <textarea {...inputProps} />
                        ) : (
                            <input {...inputProps} type='text' />
                        )}
                    </label>
                    {errorText && <small>{errorText}</small>}
                </div>
            </div>
        </ElementDialog>
    );
};

export const QuickEditor = () => {
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
