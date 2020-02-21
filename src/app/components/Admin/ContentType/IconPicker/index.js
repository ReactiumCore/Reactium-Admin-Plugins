import React, { useRef, useEffect, useState } from 'react';
import { Icon, Button } from '@atomic-reactor/reactium-ui';
import { useHookComponent, useIsContainer } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: IconPicker
 * -----------------------------------------------------------------------------
 */
const CTIconPicker = props => {
    const containerRef = useRef();
    const iconRef = useRef();
    const [state, setState] = useState({
        icon: 'Linear.Papers',
        showPicker: false,
    });

    const update = updates => {
        setState({
            ...state,
            ...updates,
        });
    };

    const IconPicker = useHookComponent('IconPicker');

    const onIconChange = e => {
        const { value } = e.target;
        const [icon] = _.flatten([value]);

        if (icon && icon !== state.icon && op.has(Icon, icon)) {
            update({
                showPicker: false,
                icon,
            });
            iconRef.current.value = icon;
        }
    };

    const onButtonClick = () => {
        update({
            showPicker: !state.showPicker,
        });
    };

    const TheIcon = op.get(Icon, state.icon, Icon.Linear.Papers);

    const isContainer = useIsContainer();

    const autoHidePanel = e => {
        const container = containerRef.current;
        if (!container || isContainer(e.target, container)) return;
        update({ showPicker: false });
    };

    // auto hide
    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.addEventListener('mousedown', autoHidePanel);
        window.addEventListener('touchstart', autoHidePanel);

        return () => {
            window.removeEventListener('mousedown', autoHidePanel);
            window.removeEventListener('touchstart', autoHidePanel);
        };
    });

    return (
        <div className='type-icon'>
            <input type='hidden' name='type-icon' ref={iconRef} />
            <Button
                size={Button.ENUMS.SIZE.SM}
                color={Button.ENUMS.COLOR.PRIMARY}
                style={{ width: '40px' }}
                onClick={onButtonClick}>
                <TheIcon />
            </Button>
            {state.showPicker && (
                <div className='type-icon-picker' ref={containerRef}>
                    <IconPicker onChange={onIconChange} />
                </div>
            )}
        </div>
    );
};

export default CTIconPicker;
