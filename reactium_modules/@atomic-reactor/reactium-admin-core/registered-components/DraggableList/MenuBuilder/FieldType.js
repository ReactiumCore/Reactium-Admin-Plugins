import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeMenuBuilder
 * -----------------------------------------------------------------------------
 */
const FieldTypeMenuBuilder = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return <FieldTypeDialog {...props} />;
};

export default FieldTypeMenuBuilder;
