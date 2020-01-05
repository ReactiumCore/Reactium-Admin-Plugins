import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeCode
 * -----------------------------------------------------------------------------
 */
const FieldTypeCode = props => {
    const FieldTypeDialog = useHookComponent('FieldTypeDialog');

    return <FieldTypeDialog {...props}>Stub FieldTypeCode</FieldTypeDialog>;
};

export default FieldTypeCode;
