import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeNumber
 * -----------------------------------------------------------------------------
 */
const FieldTypeNumber = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);
    return (
        <FieldTypeDialog {...props}>
            Stub FieldTypeNumber {props.id}
        </FieldTypeDialog>
    );
};

export default FieldTypeNumber;
