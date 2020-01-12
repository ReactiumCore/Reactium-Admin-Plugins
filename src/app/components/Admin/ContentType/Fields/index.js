import React, { useRef, useState } from 'react';
import { __, Zone, useZoneComponents } from 'reactium-core/sdk';
import { Droppable } from 'react-beautiful-dnd';
import cn from 'classnames';
import op from 'object-path';
import Enums from '../enums';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Fields
 * -----------------------------------------------------------------------------
 */
const Fields = props => {
    const region = op.get(props, 'region', 'default');
    const zone = op.get(props, 'zone', Enums.ZONE(region));
    const fields = useZoneComponents(zone);
    const isEmpty = fields.length < 1;

    return (
        <Droppable droppableId={region}>
            {({ droppableProps, innerRef, placeholder }) => (
                <div
                    className={cn('types-fields', {
                        'types-fields-empty': isEmpty,
                    })}
                    {...droppableProps}
                    ref={innerRef}>
                    <div className='field-drop'>
                        <div className='region-label'>
                            <span className='uppercase'>{region}</span>
                        </div>
                        <Zone region={region} zone={zone}>
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
                </div>
            )}
        </Droppable>
    );
};

export default Fields;
