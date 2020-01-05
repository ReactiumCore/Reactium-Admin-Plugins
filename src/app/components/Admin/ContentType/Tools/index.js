import React from 'react';
import Reactium, { __, useHandle } from 'reactium-core/sdk';
import { Button } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import Draggable from 'react-draggable';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Tools
 * -----------------------------------------------------------------------------
 */
const Tools = ({ enums = {} }) => {
    const position = Reactium.Prefs.get('types-tools-drag-handle.position', {
        x: 0,
        y: 0,
    });

    const onStop = (mouseEvent, { x, y }) => {
        Reactium.Prefs.set('types-tools-drag-handle.position', { x, y });
    };

    const { addField } = useHandle('ContentTypeEditor');

    const renderTools = () => {
        return Object.keys(enums.TYPES).map(type => {
            const tooltip = op.get(
                enums,
                ['TYPES', type, 'tooltip'],
                __(
                    'Click to add %type field type to your content type.',
                ).replace(
                    '%type',
                    op.get(enums, ['TYPES', type, 'label'], type.toLowerCase()),
                ),
            );

            const Icon = op.get(enums, ['TYPES', type, 'icon']);
            return (
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    key={type}
                    data-tooltip={tooltip}
                    data-align='left'
                    data-vertical-align='middle'
                    onClick={() => addField(type)}>
                    <span className={'sr-only'}>{tooltip}</span>
                    <Icon />
                </Button>
            );
        });
    };

    return (
        <Draggable
            handle='.types-tools-drag-handle'
            onStop={onStop}
            defaultPosition={position}>
            <div className={'types-tools'}>
                {renderTools()}
                <div className='types-tools-drag-handle'></div>
            </div>
        </Draggable>
    );
};

Tools.defaultProps = {
    enums: { TYPES: {} },
};

export default Tools;
