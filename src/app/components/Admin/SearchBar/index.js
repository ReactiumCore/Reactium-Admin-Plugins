import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';
import op from 'object-path';
import deps from 'dependencies';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
    useHandle,
    useRegisterHandle,
    useSelect,
    useStore,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Search
 * -----------------------------------------------------------------------------
 */
let Search = ({ className, icon, namespace, placeholder, ...props }, ref) => {
    const { dispatch } = useStore();

    const Tools = useHandle('AdminTools');

    const reduxState = useSelect(state => op.get(state, 'SearchBar'));

    const value = op.get(reduxState, 'value');

    const visible = op.get(reduxState, 'visible', false);

    const inputRef = useRef();

    const stateRef = useRef({ icon, placeholder, ...reduxState });

    const [, setNewState] = useState(stateRef.current);

    const setState = (newState, caller) => {
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        if (caller) {
            console.log({ [caller]: stateRef.current });
        }

        setNewState(stateRef.current);
        dispatch(deps().actions.SearchBar.setState(stateRef.current));
    };

    const cname = cn({
        [className]: !!className,
        [namespace]: !!namespace,
    });

    const cx = cls => _.compact([namespace, cls]).join('-');

    const onChange = e => {
        const { value: val = '' } = e.target;
        setState({ value: val });
    };

    const onClear = () => {
        const input = inputRef.current;
        setState({ value: null });
        input.focus();
    };

    const onFocus = e => {
        e.target.select();
        Tools.Tooltip.hide(e);
        setState({ focused: true });
    };

    const onBlur = () => setState({ focused: null });

    const render = () => {
        const {
            focused,
            icon = {},
            placeholder,
            value: currentValue,
        } = stateRef.current;

        const tooltip =
            value || focused
                ? {}
                : {
                      'data-tooltip': placeholder,
                      'data-vertical-align': 'middle',
                      'data-align': 'right',
                  };

        return visible !== true ? null : (
            <div className={cname}>
                <input
                    aria-label={ENUMS.TEXT.ARIA_SEARCH}
                    onBlur={onBlur}
                    onChange={onChange}
                    onFocus={onFocus}
                    placeholder={placeholder}
                    ref={inputRef}
                    value={currentValue || ''}
                    {...tooltip}
                />
                <Icon
                    className={cx('icon')}
                    name={op.get(icon, 'search', 'Feather.Search')}
                />
                {currentValue && (
                    <Button
                        appearance='circle'
                        aria-label={ENUMS.TEXT.ARIA_CLEAR}
                        color='primary'
                        data-align='right'
                        data-tooltip={ENUMS.TEXT.ARIA_CLEAR}
                        data-vertical-align='middle'
                        onClick={onClear}
                        size='xs'>
                        <Icon
                            name={op.get(icon, 'clear', 'Feather.X')}
                            size={16}
                        />
                    </Button>
                )}
            </div>
        );
    };

    const handle = () => ({
        ENUMS,
        input: inputRef.current,
        ref,
        setState,
        state: stateRef.current,
        value,
        visible,
    });

    useRegisterHandle('SearchBar', handle, [
        op.get(stateRef.current, 'value'),
        value,
    ]);

    useEffect(() => {
        const { value: currentValue } = stateRef.current;
        if (value !== currentValue) {
            setState({ value });
        }
    }, [op.get(stateRef.current, 'value'), value]);

    return render();
};

Search = forwardRef(Search);

Search.defaultProps = {
    focused: null,
    icon: {
        clear: 'Feather.X',
        search: 'Feather.Search',
    },
    namespace: 'admin-search-bar',
    placeholder: ENUMS.TEXT.PLACEHOLDER,
    value: null,
    visible: false,
};

export default Search;
