import _ from 'underscore';
import moment from 'moment';
import op from 'object-path';
import React, { useCallback, useEffect } from 'react';
import { useHookComponent, useSyncState } from 'reactium-core/sdk';

const formatDate = d => {
    if (typeof d === 'string') {
        d = new Date(d);
    }
    return d ? moment(d).format('L') : null;
};

const Editor = props => {
    const { editor, fieldName, options } = props;

    const state = useSyncState({
        value: formatDate(op.get(editor.value, fieldName)),
    });

    const { DatePicker } = useHookComponent('ReactiumUI');

    const ElementDialog = useHookComponent('ElementDialog');

    const onLoad = useCallback(() => {
        editor.addEventListener('before-save', onSave);
        return () => {
            editor.removeEventListener('before-save', onSave);
        };
    });

    const onSave = useCallback(e => {
        const { value } = state.get();
        const formatted = value ? new Date(value) : null;
        op.set(e.value, fieldName, formatted);
    }, []);

    const onSelectDate = useCallback(e => {
        const selected = _.compact(e.selected || []);
        const date = selected.length > 0 ? _.first(selected) : null;
        state.set('value', date);
    }, []);

    useEffect(onLoad, [editor]);

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
