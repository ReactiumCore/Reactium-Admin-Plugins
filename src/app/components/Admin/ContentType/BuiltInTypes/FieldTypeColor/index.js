import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeColor
 * -----------------------------------------------------------------------------
 */
const FieldTypeColor = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);
    return (
        <FieldTypeDialog {...props}>
            Stub FieldTypeColor {props.id}
        </FieldTypeDialog>
    );
};

export default FieldTypeColor;
