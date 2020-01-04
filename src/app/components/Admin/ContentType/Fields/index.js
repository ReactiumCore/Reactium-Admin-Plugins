import React, { useRef, useState } from 'react';
import { __, Zone } from 'reactium-core/sdk';
import { Droppable } from 'react-beautiful-dnd';
import cn from 'classnames';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Fields
 * -----------------------------------------------------------------------------
 */
const Fields = ({ fields = {} }) => {
    const isEmpty = Object.values(fields).length < 1;

    return (
        <Droppable droppableId='types-fields'>
            {({ droppableProps, innerRef, placeholder }) => (
                <div
                    className={cn('types-fields', {
                        'types-fields-empty': isEmpty,
                    })}
                    {...droppableProps}
                    ref={innerRef}>
                    <Zone zone={'types-fields'}>
                        {isEmpty && (
                            <div className='empty-message'>
                                <span>
                                    {__(
                                        'Compose the new Content Type Schema by adding elements from the toolbar here.',
                                    )}
                                </span>
                            </div>
                        )}
                    </Zone>
                    {placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default Fields;
