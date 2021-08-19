import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';
import op from 'object-path';
import domain from './domain';
import deps from 'dependencies';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import React, { forwardRef, useEffect, useRef } from 'react';
import { useHandle, useRegisterHandle } from 'reactium-core/sdk';
import { useReduxState } from '@atomic-reactor/use-select';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Search
 * -----------------------------------------------------------------------------
 */
let Search = ({ className, namespace, ...props }, ref) => {
    const [state, setState] = useReduxState(domain.name);

    const Tools = useHandle('AdminTools');

    const inputRef = useRef();

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
        const { focused, icon = {}, placeholder, value, visible } = state;

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
                    value={value || ''}
                    {...tooltip}
                />
                <Icon
                    className={cx('icon')}
                    name={op.get(icon, 'search', 'Feather.Search')}
                />
                {value && (
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
        state,
        value: op.get(state, 'value'),
        visible: op.get(state, 'visible'),
    });

    useRegisterHandle('SearchBar', handle, [
        op.get(state, 'value'),
        op.get(state, 'visible'),
    ]);

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
