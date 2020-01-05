import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';
import cn from 'classnames';

const FieldType = props => {
    const type = op.get(props, 'type', 'text');
    const fieldTypeComponent = op.get(
        props,
        'fieldTypeComponent',
        `FieldType${type}`,
    );
    const Type = useHookComponent(fieldTypeComponent);
    return (
        <div
            className={cn(
                'field-type-wrapper',
                `field-type-wrapper-${type.toLowerCase().replace(/\s+/g, '')}`,
            )}>
            <Type {...props} />
        </div>
    );
};

export default FieldType;
