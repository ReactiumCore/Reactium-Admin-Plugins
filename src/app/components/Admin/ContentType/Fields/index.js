import React, { useRef, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
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
const noop = () => {};
const Fields = props => {
    const region = op.get(props, 'region.id', 'default');
    const regionLabel = op.get(props, 'region.label');
    const regionSlug = op.get(props, 'region.slug', 'default');
    const regions = op.get(props, 'regions', {});
    const zone = op.get(props, 'zone', Enums.ZONE(region));
    const onRegionLabelChange = op.get(props, 'onRegionLabelChange', noop);
    const onRemoveRegion = op.get(props, 'onRemoveRegion', noop);
    const fields = useZoneComponents(zone);
    const isEmpty = fields.length < 1;
    const deleteLabel = __('Remove Field Region');
    const immutable = op.has(Enums.REQUIRED_REGIONS, region);
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
                        {typeof regionLabel !== 'undefined' && (
                            <div className='region-label'>
                                <div
                                    className={cn('input-group', {
                                        error:
                                            regionLabel.length < 1 ||
                                            Object.values(regions).find(
                                                reg =>
                                                    reg.id !== region &&
                                                    reg.slug === regionSlug,
                                            ),
                                    })}>
                                    <input
                                        type='text'
                                        value={regionLabel}
                                        placeholder={__('Region Label')}
                                        onChange={e =>
                                            onRegionLabelChange(e.target.value)
                                        }
                                    />
                                    <Button
                                        data-tooltip={deleteLabel}
                                        style={{ width: 50, height: 50 }}
                                        color={
                                            immutable
                                                ? Button.ENUMS.COLOR.TERTIARY
                                                : Button.ENUMS.COLOR.DANGER
                                        }
                                        onClick={onRemoveRegion}
                                        disabled={immutable}>
                                        <span className='sr-only'>
                                            {deleteLabel}
                                        </span>
                                        <Icon.Feather.X />
                                    </Button>
                                </div>
                            </div>
                        )}
                        <Zone region={region} zone={zone}>
                            {isEmpty && region === 'default' && (
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
