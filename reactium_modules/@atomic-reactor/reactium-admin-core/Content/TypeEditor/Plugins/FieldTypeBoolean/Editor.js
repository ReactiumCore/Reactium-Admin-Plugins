import op from 'object-path';
import React, { useCallback, useEffect } from 'react';
import { useHookComponent } from '@atomic-reactor/reactium-core/sdk';

const Editor = (props) => {
    const { editor, options, fieldName } = props;

    const { Checkbox } = useHookComponent('ReactiumUI');

    const onSubmit = useCallback((e) => {
        const fieldName =
            String(props.fieldName).startsWith('data.') ||
            String(props.fieldName).startsWith('meta.')
                ? props.fieldName
                : `data.${props.fieldName}`;

        let value = op.get(e.value, fieldName, false);
        value = value === null ? false : value;

        op.set(e.value, fieldName, value || false);
    }, []);

    const defaultChecked = op.get(
        editor.Form.value,
        fieldName,
        editor.isNew ? options.defaultChecked : false,
    );

    useEffect(() => {
        editor.addEventListener('submit', onSubmit);
        return () => {
            editor.removeEventListener('submit', onSubmit);
        };
    }, [editor]);

    return (
        <div className='field-type-boolean'>
            <div className='ar-dialog-header'>
                <Checkbox
                    name={fieldName}
                    className='block'
                    defaultChecked={defaultChecked}
                    label={op.get(options, 'label', fieldName)}
                />
            </div>
        </div>
    );
};

export { Editor, Editor as default };
