import React, { useRef, useEffect, useState } from 'react';
import { Icon, Button } from 'reactium-ui';
import { useHandle, useHookComponent, useIsContainer } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';
import Enums from '../enums';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: IconPicker
 * -----------------------------------------------------------------------------
 */
const CTIconPicker = props => {
    const pickerRef = useRef();

    const defaultIcon = Enums.DEFAULT_ICON;
    const containerRef = useRef();
    const CTE = useHandle('ContentTypeEditor');
    const currentIcon =
        props.value || op.get(CTE.getValue(), 'meta.icon', defaultIcon);
    const [state, setState] = useState({
        icon: currentIcon,
        showPicker: false,
    });

    const update = updates => {
        const newState = {
            ...state,
            ...updates,
        };

        setState(newState);
    };

    const IconPicker = useHookComponent('IconPicker');

    const onButtonClick = () => {
        update({
            showPicker: !state.showPicker,
        });
    };

    const onIconChange = e => {
        const { value } = e.target;
        const [icon] = _.flatten([value]);

        if (icon && icon !== state.icon && op.has(Icon, icon)) {
            update({
                showPicker: false,
                icon,
            });
        }
    };

    const isContainer = useIsContainer();

    const _search = value => pickerRef.current.setSearch(value);
    const search = _.throttle(_search, 100);

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

    useEffect(() => {
        update({ icon: currentIcon });
    }, [currentIcon]);

    return (
        <div className='type-icon'>
            <input
                type='hidden'
                name={props.name}
                value={state.icon || defaultIcon}
            />
            <Button
                size={Button.ENUMS.SIZE.SM}
                color={Button.ENUMS.COLOR.PRIMARY}
                style={{ width: '40px' }}
                onClick={onButtonClick}>
                <Icon name={state.icon} />
            </Button>
            {state.showPicker && (
                <div className='type-icon-picker' ref={containerRef}>
                    <div className='rte-icons-search'>
                        <div className='form-group'>
                            <input
                                type='search'
                                placeholder='search'
                                onFocus={e => e.target.select()}
                                onChange={e => search(e.target.value)}
                            />
                        </div>
                    </div>
                    <IconPicker onChange={onIconChange} ref={pickerRef} />
                </div>
            )}
        </div>
    );
};

CTIconPicker.defaultProps = {
    name: 'meta.icon',
};

export default CTIconPicker;
