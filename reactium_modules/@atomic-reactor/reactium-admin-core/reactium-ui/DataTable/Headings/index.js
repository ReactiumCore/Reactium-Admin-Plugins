import React from 'react';
import Heading from '../Heading';
import ENUMS from '../enums';
import { Feather } from 'reactium-ui/Icon';

const style = {
    width: 30,
    maxWidth: 30,
    minWidth: 30,
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const Headings = ({
    columns,
    data = [],
    multiselect,
    namespace,
    onClick,
    onToggleAll,
    selectable,
    sort,
    sortable,
    sortBy,
}) => {
    const selection = data.filter(item => Boolean(item.selected === true));

    return !columns ? null : (
        <div className={`${namespace}-headings`}>
            {selectable === true && (
                <label className={`${namespace}-select`} style={style}>
                    {multiselect === true ? (
                        <>
                            <input
                                type='checkbox'
                                checked={selection.length > 0}
                                onChange={onToggleAll}
                            />
                            <span className='box'>
                                <Feather.Check width={15} height={15} />
                            </span>
                        </>
                    ) : (
                        <span className='dash' />
                    )}
                </label>
            )}
            {Object.entries(columns).map(([key, value]) => {
                value =
                    typeof value === 'string'
                        ? { label: value, textAlign: ENUMS.TEXT_ALIGN.LEFT }
                        : value;

                let { label, ...columnProps } = value;

                label =
                    typeof labelFunction === 'function'
                        ? labelFunction(key, label)
                        : label;

                columnProps = {
                    field: key,
                    label,
                    onClick,
                    sort,
                    sortable,
                    sortBy,
                    ...columnProps,
                };

                const className =
                    sortBy === key && sortable
                        ? String(`sort-active-${sort}`).toLowerCase()
                        : null;

                return (
                    <Heading
                        key={`${namespace}-heading-${key}`}
                        className={className}
                        {...columnProps}>
                        {label}
                    </Heading>
                );
            })}
        </div>
    );
};

export default Headings;
