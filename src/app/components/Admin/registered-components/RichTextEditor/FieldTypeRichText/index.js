import React from 'react';
import { Checkbox } from '@atomic-reactor/reactium-ui';
import { useHookComponent, __ } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeText
 * -----------------------------------------------------------------------------
 */
const FieldTypeText = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return <FieldTypeDialog {...props}></FieldTypeDialog>;
};

export default FieldTypeText;
