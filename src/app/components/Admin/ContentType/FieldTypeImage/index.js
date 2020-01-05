import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeImage
 * -----------------------------------------------------------------------------
 */
const FieldTypeImage = props => {
    const FieldTypeDialog = useHookComponent('FieldTypeDialog');

    return <FieldTypeDialog {...props}>Stub FieldTypeImage</FieldTypeDialog>;
};

export default FieldTypeImage;
