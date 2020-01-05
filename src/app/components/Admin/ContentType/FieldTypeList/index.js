import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeList
 * -----------------------------------------------------------------------------
 */
const FieldTypeList = props => {
    const FieldTypeDialog = useHookComponent('FieldTypeDialog');

    return <FieldTypeDialog {...props}>Stub FieldTypeList</FieldTypeDialog>;
};

export default FieldTypeList;
