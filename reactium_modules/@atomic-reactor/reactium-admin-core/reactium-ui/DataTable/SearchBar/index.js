import React from 'react';
import cn from 'classnames';
import { Feather } from 'reactium-ui/Icon';

const noop = () => {};
const DefaultIcon = () => <Feather.Search />;

const SearchBar = ({
    className = null,
    expanded,
    icon = null,
    namespace = 'ar-data-table',
    onBlur = noop,
    onFocus = noop,
    defaultValue,
    value,
    ...props
}) => {
    const Icon = !icon ? DefaultIcon : icon;

    const _onFocus = e => {
        e.target.classList.add('focus');
        onFocus(e);
    };

    const _onBlur = e => {
        const { value } = e.target;
        if (!value && expanded !== true) {
            e.target.classList.remove('focus');
        }
        onBlur(e);
    };

    const expand = expanded || value || defaultValue;

    if (value) {
        props['value'] = value;
    }
    if (defaultValue) {
        props['defaultValue'] = defaultValue;
    }

    return (
        <label
            className={cn({
                [`${namespace}-search`]: true,
                [className]: !!className,
            })}>
            <input
                className={cn({ focus: expand })}
                type='text'
                onFocus={_onFocus}
                onBlur={_onBlur}
                {...props}
            />
            <span className='bg' />
            <span className='ico'>
                <Icon />
            </span>
        </label>
    );
};

export default SearchBar;
