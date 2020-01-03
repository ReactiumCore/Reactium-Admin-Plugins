import React from 'react';
import { __, Zone } from 'reactium-core/sdk';
import { Droppable } from 'react-beautiful-dnd';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Fields
 * -----------------------------------------------------------------------------
 */
const Fields = ({ fields = {} }) => {
    return (
        <Droppable droppableId='types-fields-dropzone'>
            {({ droppableProps, innerRef, placeholder }) => (
                <div
                    className='types-fields-dropzone'
                    {...droppableProps}
                    ref={innerRef}>
                    <Zone zone={'types-fields-dropzone'} />
                    {placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default Fields;
