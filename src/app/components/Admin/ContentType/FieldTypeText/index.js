import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeText
 * -----------------------------------------------------------------------------
 */
const FieldTypeText = props => {
    const FieldTypeDialog = useHookComponent('FieldTypeDialog');

    return <FieldTypeDialog {...props}>Stub FieldTypeText</FieldTypeDialog>;
};

export default FieldTypeText;
