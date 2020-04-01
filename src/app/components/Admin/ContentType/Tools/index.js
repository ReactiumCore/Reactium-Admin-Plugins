import React from 'react';
import Reactium, { __, useHandle } from 'reactium-core/sdk';
import { Button } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import Draggable from 'react-draggable';
import _ from 'underscore';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Tools
 * -----------------------------------------------------------------------------
 */
const Tools = () => {
    const position = Reactium.Prefs.get('types-tools-drag-handle.position', {
        x: 0,
        y: 0,
    });

    const onStop = (mouseEvent, { x, y }) => {
        Reactium.Prefs.set('types-tools-drag-handle.position', { x, y });
    };

    const { addField, addRegion } = useHandle('ContentTypeEditor');

    const renderTools = () => {
        return _.sortBy(Reactium.ContentType.FieldType.list, 'order').map(
            type => {
                const tooltip = op.get(
                    type,
                    'tooltip',
                    __(
                        'Click to add %type field type to your content type.',
                    ).replace(
                        '%type',
                        op.get(
                            type,
                            'label',
                            op.get(type, 'type').toLowerCase(),
                        ),
                    ),
                );

                const Icon = op.get(type, 'icon');
                return (
                    <Button
                        color={Button.ENUMS.COLOR.CLEAR}
                        key={op.get(type, 'type')}
                        data-tooltip={tooltip}
                        data-align='left'
                        data-vertical-align='middle'
                        onClick={() => addField(op.get(type, 'type'))}>
                        <span className={'sr-only'}>{tooltip}</span>
                        <Icon />
                    </Button>
                );
            },
        );
    };

    const addRegionLabel = __('Add Region');
    return (
        <Draggable
            handle='.types-tools-drag-handle'
            onStop={onStop}
            defaultPosition={position}>
            <div className={'types-tools'}>
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    data-tooltip={addRegionLabel}
                    data-align='left'
                    data-vertical-align='middle'
                    onClick={() => addRegion()}>
                    <span className={'sr-only'}>{addRegionLabel}</span>
                    <div className='add-region-icon'></div>
                </Button>
                {renderTools()}
                <div className='types-tools-drag-handle'></div>
            </div>
        </Draggable>
    );
};

Tools.defaultProps = {};

export default Tools;
