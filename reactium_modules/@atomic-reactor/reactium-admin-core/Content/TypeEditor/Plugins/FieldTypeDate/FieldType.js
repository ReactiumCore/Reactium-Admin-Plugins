import _ from 'underscore';
import op from 'object-path';
import React, { useEffect } from 'react';
import {
    __,
    useHandle,
    useHookComponent,
    useRefs,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

export const FieldType = (props) => {
    const { id } = props;

    const refs = useRefs();

    const Editor = useHandle('CTE');

    const val = id
        ? op.get(Editor.getValue(), ['fields', id, 'options'], {})
        : {};

    const state = useSyncState({
        options: {
            min: op.get(val, 'min'),
            max: op.get(val, 'max'),
        },
    });

    const FieldTypeDialog = useHookComponent('FieldTypeDialog');

    const { DatePicker } = useHookComponent('ReactiumUI');

    const onSelectDate = (e) => {
        let { id: ID, selected = [] } = e;

        ID = String(ID).replace('calendar-', '').substr(0, 3);

        selected = _.compact(selected);

        const date = selected.length > 0 ? _.first(selected) : null;

        state.set(`options.${ID}`, date);
    };

    const onBeforeSave = (params) => {
        const { fieldId } = params;
        if (fieldId !== id) return;
        op.set(params, 'fieldValue.options', state.get('options'));
    };

    const onLoad = () => {
        const hooks = [
            Reactium.Hook.registerSync('content-type-form-save', onBeforeSave),
        ];

        return () => {
            hooks.forEach((hookId) => Reactium.Hook.unregister(hookId));
        };
    };

    useEffect(onLoad, [Object.values(refs.get())]);

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-date'>
                <div className='row'>
                    <div className='col-xs-12 col-md-6 pr-md-6 mb-xs-12 mb-md-0'>
                        <div className='form-group'>
                            <label className='block'>
                                {__('Minimum Date')}:
                                <DatePicker
                                    readOnly
                                    id='minDate'
                                    align='right'
                                    onChange={onSelectDate}
                                    value={state.get('options.min')}
                                    ref={(elm) => refs.set('min', elm)}
                                />
                            </label>
                        </div>
                    </div>
                    <div className='col-xs-12 col-md-6 pl-md-6'>
                        <div className='form-group'>
                            <label className='block'>
                                {__('Maximum Date')}:
                                <DatePicker
                                    readOnly
                                    id='maxDate'
                                    align='right'
                                    onChange={onSelectDate}
                                    value={state.get('options.max')}
                                    ref={(elm) => refs.set('max', elm)}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </FieldTypeDialog>
    );
};
