import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeText
 * -----------------------------------------------------------------------------
 */
const FieldTypeText = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);
    return (
        <FieldTypeDialog {...props}>
            Stub FieldTypeText {props.id}
        </FieldTypeDialog>
    );
};

export default FieldTypeText;
