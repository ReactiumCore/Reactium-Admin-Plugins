import op from 'object-path';
import { Checkbox, Dialog } from 'reactium-ui';
import React, { useEffect, useRef } from 'react';
import { __, useHookComponent } from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeText
 * -----------------------------------------------------------------------------
 */
export const FieldType = (props) => {
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

export const Editor = (props) => {
    let {
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

    defaultValue = [null, 'null'].includes(defaultValue) ? '' : defaultValue;

    const inputRef = useRef();
    const ElementDialog = useHookComponent('ElementDialog');
    const { FormError, FormRegister } = useHookComponent('ReactiumUI');

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

    const parseError = (str) => {
        const replacers = {
            '%fieldName': fieldName,
            '%max': max,
            '%min': min,
        };

        str = String(str);

        Object.entries(replacers).forEach(([s, v]) => {
            str = str.replace(new RegExp(s, 'gi'), v);
        });

        return str;
    };

    const validate = ({ values }) => {
        let err;

        const v = values[fieldName];

        if (required === true && !v) {
            err = parseError(__('%fieldName is required'));
        }

        if (v && min && !err) {
            if (String(v).length < Number(min)) {
                err = parseError(
                    __('%fieldName minimum character count is %min'),
                );
            }
        }

        if (v && max && !err) {
            if (String(v).length > Number(max)) {
                err = parseError(
                    __('%fieldName maximum character count is %max'),
                );
            }
        }

        if (err) editor.setError(fieldName, err);
    };

    useEffect(() => {
        editor.addEventListener('validate', validate);
        return () => {
            editor.removeEventListener('validate', validate);
        };
    }, [editor]);

    return (
        <FormRegister>
            <ElementDialog {...props}>
                <div className='p-xs-20'>
                    <div className='form-group'>
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
                        <FormError name={fieldName} />
                    </div>
                </div>
            </ElementDialog>
        </FormRegister>
    );
};

export const QuickEditor = () => {
    return 'Text QuickEditor';
};

export const Comparison = (props) => {
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
