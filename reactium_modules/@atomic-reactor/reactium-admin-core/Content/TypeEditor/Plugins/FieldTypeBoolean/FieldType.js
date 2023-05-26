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

    const { Toggle } = useHookComponent('ReactiumUI');

    const val = id
        ? op.get(Editor.getValue(), ['fields', id, 'options'], {})
        : {};

    const state = useSyncState({
        options: {
            defaultChecked: op.get(val, 'defaultChecked', false),
            label: op.get(val, 'label', ''),
        },
    });

    const FieldTypeDialog = useHookComponent('FieldTypeDialog');

    const onBeforeSave = (params) => {
        const { fieldId } = params;
        if (fieldId !== id) return;
        op.set(params, 'fieldValue.options', state.get('options'));
    };

    const onChange = (e) =>
        state.set('options.defaultChecked', e.target.checked);

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
            <div className='form-group'>
                <label>
                    Label:
                    <input
                        type='text'
                        value={state.get('options.label', '')}
                        onChange={(e) =>
                            state.set('options.label', e.target.value)
                        }
                    />
                </label>
            </div>
            <div>
                <Toggle
                    onChange={onChange}
                    label={
                        <>
                            <strong>{__('Default:')}</strong>{' '}
                            <em>
                                {String(
                                    state.get('options.defaultChecked', false),
                                )}
                            </em>
                        </>
                    }
                    defaultChecked={state.get('options.defaultChecked')}
                />
            </div>
        </FieldTypeDialog>
    );
};
