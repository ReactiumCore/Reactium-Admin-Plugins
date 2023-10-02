import op from 'object-path';
import React, { useEffect } from 'react';

import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldType
 * -----------------------------------------------------------------------------
 */
export const FieldType = (props) => {
    const { id } = props;

    const currRequired = () => {
        let checked = false;

        if (props.formRef.current) {
            const values = props.formRef.current.getValue();
            checked = values.required || checked;
        }

        return checked;
    };

    const [state, setState] = useDerivedState({
        required: currRequired(),
    });

    const { DragHandle } = props;
    const { Toggle } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const cx = Reactium.Utils.cxFactory('object-cte');

    const onBeforeSave = ({ fieldId, fieldValue }) => {
        if (fieldId === id) {
            op.set(fieldValue, 'required', state.required || false);
        }
    };

    const onFormChange = ({ value }) => {
        if (value) setState({ required: op.get(value, 'required', false) });
    };

    const onLoad = () => {
        const hooks = [
            Reactium.Hook.register(
                `field-type-form-change-${id}`,
                onFormChange,
            ),
            Reactium.Hook.registerSync('content-type-form-save', onBeforeSave),
        ];

        return () => {
            hooks.forEach((hookId) => Reactium.Hook.unregister(hookId));
        };
    };

    useEffect(onLoad);

    const render = () => {
        return (
            <FieldTypeDialog {...props} showHelpText={false}>
                <div className={cx()}>
                    <div className='row'>
                        <div className='col-xs-12'>
                            <div className='form-group'>
                                <input
                                    type='text'
                                    name='placeholder'
                                    placeholder={__('Placeholder')}
                                />
                            </div>
                        </div>
                        <div className='col-xs-12'>
                            <div className='mt-xs-20'>
                                <Toggle
                                    value={true}
                                    name='required'
                                    defaultChecked={state.required}
                                    label={
                                        <>
                                            <strong>{__('Required:')}</strong>{' '}
                                            <em>
                                                {String(
                                                    state.required || false,
                                                )}
                                            </em>
                                        </>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </FieldTypeDialog>
        );
    };

    return render();
};
