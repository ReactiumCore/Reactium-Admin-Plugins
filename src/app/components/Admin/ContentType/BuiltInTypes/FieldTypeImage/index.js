import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeImage
 * -----------------------------------------------------------------------------
 */
const FieldTypeImage = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);
    return <FieldTypeDialog {...props}></FieldTypeDialog>;
};

export default FieldTypeImage;
