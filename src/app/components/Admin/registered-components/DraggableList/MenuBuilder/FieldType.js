import React, { useEffect, useRef } from 'react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Checkbox } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeMenuBuilder
 * -----------------------------------------------------------------------------
 */
const FieldTypeMenuBuilder = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);
    const itemTypes = Reactium.MenuBuilder.ItemType.list || [];

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-menu-builder'>
                {itemTypes.map(({ id, label, type }) => {
                    // console.log({id, label});
                    return (
                        <div key={id} className='input-group py-xs-8'>
                            <Checkbox name={`${type}.${id}`} label={label} />
                        </div>
                    );
                })}
            </div>
        </FieldTypeDialog>
    );
};

export default FieldTypeMenuBuilder;
