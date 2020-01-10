import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeList
 * -----------------------------------------------------------------------------
 */
const FieldTypeList = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);
    return <FieldTypeDialog {...props}></FieldTypeDialog>;
};

export default FieldTypeList;
