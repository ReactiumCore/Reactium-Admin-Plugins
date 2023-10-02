import _ from 'underscore';
import op from 'object-path';
import React, { useEffect } from 'react';
import { PointerInput } from '../FieldTypeObject/PointerInput';
import {
    __,
    useHookComponent,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

export const Editor = (props) => {
    const { editor, fieldName, required = false } = props;

    const ElementDialog = useHookComponent('ElementDialog');
    const { FormRegister, FormError } = useHookComponent('ReactiumUI');

    const state = useSyncState({
        value: op.get(editor.Form.value, fieldName),
    });

    const onChange = (e) => {
        const value = _.isArray(e.value) ? _.first(e.value) : e.value;
        state.set('value', value);
        editor.Form.setValue(fieldName, value);
    };

    const onSubmit = (e) => {
        const fieldName =
            String(props.fieldName).startsWith('data.') ||
            String(props.fieldName).startsWith('meta.')
                ? props.fieldName
                : `data.${props.fieldName}`;

        const values = state.get('value') || [];

        op.set(e.value, fieldName, values);
    };

    const parseError = (str) => {
        const replacers = {
            '%fieldName': fieldName,
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

        if (!err && required === true && !v) {
            err = parseError(__('%fieldName is required'));
        }

        if (!err && Array.isArray(v) && v.length < 1) {
            err = parseError(__('%fieldName is required'));
        }

        if (err) editor.setError(fieldName, err);
    };

    useEffect(() => {
        editor.addEventListener('submit', onSubmit);
        return () => {
            editor.removeEventListener('submit', onSubmit);
        };
    }, [editor]);

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
                        <PointerInput
                            {...props}
                            onChange={onChange}
                            value={state.get('value')}
                        />
                        <FormError name={fieldName} />
                    </div>
                </div>
            </ElementDialog>
        </FormRegister>
    );
};
