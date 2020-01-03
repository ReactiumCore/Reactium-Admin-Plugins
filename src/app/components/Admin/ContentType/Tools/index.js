import React from 'react';
import { __ } from 'reactium-core/sdk';
import { Button, Prefs } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import Draggable from 'react-draggable';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Tools
 * -----------------------------------------------------------------------------
 */
const noop = () => {};
const Tools = ({ enums = {}, onButtonClick = noop }) => {
    const position = Prefs.get('types-tools-drag-handle.position', {
        x: 0,
        y: 0,
    });

    const onStop = (mouseEvent, { x, y }) => {
        Prefs.set('types-tools-drag-handle.position', { x, y });
    };

    const renderTools = () => {
        return Object.keys(enums.TYPES).map(type => {
            const tooltip = op.get(
                enums,
                ['TOOLTIP', type],
                __('Click to add %type to your content type.').replace(
                    '%type',
                    enums.TYPES[type],
                ),
            );

            const Icon = enums.ICONS[type];
            return (
                <Button
                    color={Button.ENUMS.COLOR.CLEAR}
                    key={type}
                    data-tooltip={tooltip}
                    data-align='left'
                    data-vertical-align='middle'
                    onClick={() => onButtonClick(type)}>
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
    onButtonClick: noop,
};

export default Tools;
