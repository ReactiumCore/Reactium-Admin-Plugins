import _ from 'underscore';
import op from 'object-path';
import React, { useEffect } from 'react';
import { useHookComponent, useSyncState } from 'reactium-core/sdk';

const Editor = props => {
    const { editor, fieldName, options } = props;

    const state = useSyncState({
        value: op.get(editor.value, fieldName),
    });

    const { DatePicker } = useHookComponent('ReactiumUI');

    const ElementDialog = useHookComponent('ElementDialog');

    const onSave = e => {
        const { value } = state.get();
        const formatted = value ? new Date(value) : null;
        op.set(e.value, fieldName, formatted);
    };

    const onSelectDate = e => {
        const selected = _.compact(e.selected || []);
        const date = selected.length > 0 ? _.first(selected) : null;
        state.set('value', date);
    };

    useEffect(() => {
        editor.addEventListener('before-save', onSave);
        return () => {
            editor.removeEventListener('before-save', onSave);
        };
    }, [editor]);

    return (
        <ElementDialog {...props}>
            <div className='field-type-date p-xs-20'>
                <DatePicker
                    readOnly
                    onChange={onSelectDate}
                    value={state.get('value')}
                    maxDate={op.get(options, 'max')}
                    minDate={op.get(options, 'min')}
                />
            </div>
        </ElementDialog>
    );
};

export { Editor, Editor as default };
