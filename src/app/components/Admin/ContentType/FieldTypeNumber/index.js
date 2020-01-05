import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeNumber
 * -----------------------------------------------------------------------------
 */
const FieldTypeNumber = props => {
    const FieldTypeDialog = useHookComponent('FieldTypeDialog');

    return <FieldTypeDialog {...props}>Stub FieldTypeNumber</FieldTypeDialog>;
};

export default FieldTypeNumber;
