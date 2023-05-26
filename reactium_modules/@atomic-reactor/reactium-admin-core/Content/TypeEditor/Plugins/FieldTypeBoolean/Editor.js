import op from 'object-path';
import React, { useCallback, useEffect } from 'react';
import {
    useHookComponent,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

const Editor = (props) => {
    const { editor, fieldName, options } = props;

    const { Checkbox } = useHookComponent('ReactiumUI');

    const onChange = (e) => state.set('value', e.target.checked);

    const onLoad = useCallback(() => {
        editor.addEventListener('before-save', onSave);
        return () => {
            editor.removeEventListener('before-save', onSave);
        };
    });

    const onSave = useCallback((e) => {
        const { value } = state.get();
        op.set(e.value, fieldName, value);
    }, []);

    const state = useSyncState({
        value: op.get(
            editor.value,
            fieldName,
            op.get(options, 'defaultChecked', false),
        ),
    });

    useEffect(onLoad, [editor]);

    return (
        <div className='field-type-boolean'>
            <div className='ar-dialog-header'>
                <Checkbox
                    onChange={onChange}
                    className='block'
                    defaultChecked={state.get('value')}
                    label={op.get(options, 'label', fieldName)}
                />
            </div>
        </div>
    );
};

export { Editor, Editor as default };
