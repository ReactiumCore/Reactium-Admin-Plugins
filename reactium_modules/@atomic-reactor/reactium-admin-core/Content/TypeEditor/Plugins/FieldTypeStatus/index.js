import React from 'react';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeStatus
 * -----------------------------------------------------------------------------
 */
export const Editor = ({ className, ...props }) => {
    const ElementDialog = useHookComponent('ElementDialog');
    const { FormError, FormRegister } = useHookComponent('ReactiumUI');

    return (
        <ElementDialog {...props}>
            <div className='p-xs-20'>
                <div className={className}>
                    <FormRegister>
                        <select name='status'>
                            {Object.values(Reactium.Content.STATUS).map(
                                ({ label, value }) => (
                                    <option
                                        value={value}
                                        key={`status-${value}`}>
                                        {String(label).toLowerCase()}
                                    </option>
                                ),
                            )}
                        </select>
                    </FormRegister>
                    <FormError name='status' />
                </div>
            </div>
        </ElementDialog>
    );
};

Editor.defaultProps = {
    className: 'form-group',
};
