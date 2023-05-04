import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Button, Icon } from 'reactium-ui';
import React, { useCallback, useState } from 'react';
import { __, cxFactory, useDispatcher, useRefs, Zone } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Search
 * -----------------------------------------------------------------------------
 */

export const SearchBarSubmitButton = ({ submit }) => (
    <Button
        className='go'
        onClick={submit}
        children={__('go')}
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.TERTIARY}
    />
);

export const SearchBar = ({
    className,
    namespace,
    onSubmit,
    value: defaultValue,
    ...props
}) => {
    const refs = useRefs();

    const cx = cxFactory(`${op.get(props, 'data-zone-ns')}-${namespace}`);

    const [value, setValue] = useState(defaultValue);

    const dispatch = useDispatcher({ props });

    const isValue = useCallback(() => String(value).length > 0, [value]);

    const clear = useCallback(() => {
        const input = refs.get('input');
        input.value = '';
        input.focus();

        dispatch(cx('clear'));
        setValue('');
        submit();
    }, []);

    const submit = useCallback(
        v => {
            v = typeof v !== 'string' ? value : v;
            if (typeof onSubmit === 'function') return onSubmit({ value: v });
            dispatch(cx(), { value: v });
        },
        [value],
    );

    const onChange = useCallback(e => {
        dispatch(cx('change'), { details: e });
        setValue(e.target.value);
        submit(e.target.value);
    }, []);

    const onKeyUp = useCallback(
        e => {
            if (e.keyCode !== 13) return;
            submit();
        },
        [value],
    );

    const handle = {
        'data-parent': props,
        clear,
        cx,
        dispatch,
        isValue,
        refs,
        setValue,
        submit,
        value,
    };

    return (
        <div className={cn(cx(), className)}>
            {isValue() ? (
                <Button
                    onClick={clear}
                    className='clear'
                    size={Button.ENUMS.SIZE.XS}
                    color={Button.ENUMS.COLOR.DANGER}
                    appearance={Button.ENUMS.APPEARANCE.CIRCLE}>
                    <Icon name='Feather.X' size={13} />
                </Button>
            ) : (
                <Icon className='search' name='Feather.Search' size={18} />
            )}
            <input
                {...props}
                type='text'
                onKeyUp={onKeyUp}
                onChange={onChange}
                defaultValue={value}
                style={{ marginBottom: 0 }}
                ref={elm => refs.set('input', elm)}
            />
            <div className={cx('actions')}>
                <Zone zone={cx('actions')} {...handle} />
            </div>
        </div>
    );
};

SearchBar.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    onSubmit: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string,
};

SearchBar.defaultProps = {
    className: 'form-group',
    namespace: 'search',
    placeholder: __('search'),
    value: '',
};
