import cn from 'classnames';
import op from 'object-path';
import React from 'react';
import ENUMS from '../enums';
import slugify from 'slugify';

const Column = ({
    children,
    className,
    field,
    i: idx,
    labelFunction,
    namespace = 'ar-data-table-col',
    onClick,
    textAlign = ENUMS.TEXT_ALIGN.LEFT,
    verticalAlign = ENUMS.VERTICAL_ALIGN.TOP,
    width,
    sortable = false,
    style = {},
    title,
    provided = {},
}) => {
    field = field ? `${namespace}-${slugify(field)}` : field;
    idx = idx && field ? `${field}-${idx - 1}` : null;

    const colProps = {
        onClick,
        className: cn({
            [namespace]: !!namespace,
            [field]: !!field,
            [idx]: !!idx,
            [className]: !!className,
            [textAlign]: !!textAlign,
            [verticalAlign]: !!verticalAlign,
            sortable,
        }),
        style: {
            width,
            maxWidth: width,
            minWidth: width ? width : Math.floor((1 / 12) * 100) + '%',
            flexGrow: width ? 0 : 1,
            flexShrink: width ? 0 : 1,
            ...style,
        },
        title,
    };

    return sortable ? (
        <button {...colProps} type='button'>
            {labelFunction ? labelFunction(field, children) : children}
        </button>
    ) : (
        <div {...colProps} {...op.get(provided, 'dragHandleProps', {})}>
            {labelFunction ? labelFunction(field, children) : children}
        </div>
    );
};
export default Column;
