import React from 'react';
import ENUMS from '../enums';
import Column from '../Column';
import { Linear } from 'reactium-ui/Icon';

const noop = () => {};

const Heading = ({
    children,
    field,
    label,
    namespace = 'ar-data-table-heading',
    onClick = noop,
    sort,
    sortable,
    sortType,
    ...props
}) => {
    const dir = sort === ENUMS.SORT.ASC ? 'descending' : 'ascending';
    const evt = {
        label,
        sort: sort === ENUMS.SORT.ASC ? ENUMS.SORT.DESC : ENUMS.SORT.ASC,
        sortBy: field,
        sortType,
    };
    const canSort =
        sortable === true &&
        sortType &&
        Object.values(ENUMS.SORT_TYPE).includes(sortType);

    const Icon = canSort
        ? () =>
              Linear[ENUMS.SORT_ICON[sort][sortType]]({ width: 14, height: 14 })
        : () => null;

    onClick = canSort ? onClick : noop;

    return (
        <Column
            field={field}
            title={
                canSort ? `Sort by ${String(label).toLowerCase()} ${dir}` : null
            }
            namespace={namespace}
            sortable={sortable}
            {...props}
            onClick={e => onClick({ ...e, ...evt })}>
            {children}
            <span className='ico'>
                <Icon />
            </span>
        </Column>
    );
};

export default Heading;
