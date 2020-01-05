import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeColor
 * -----------------------------------------------------------------------------
 */
const FieldTypeColor = props => {
    const FieldTypeDialog = useHookComponent('FieldTypeDialog');

    return <FieldTypeDialog {...props}>Stub FieldTypeColor</FieldTypeDialog>;
};

export default FieldTypeColor;
