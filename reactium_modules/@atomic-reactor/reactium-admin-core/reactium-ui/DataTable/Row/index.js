import cn from 'classnames';
import React, { forwardRef } from 'react';

const Row = (
    {
        children,
        className,
        namespace = 'ar-data-table-row',
        selectable = false,
        ...props
    },
    ref,
) =>
    selectable ? (
        <label
            ref={ref}
            className={cn({
                [namespace]: !!namespace,
                [className]: !!className,
            })}
            {...props}>
            {children}
        </label>
    ) : (
        <div
            ref={ref}
            className={cn({
                [namespace]: !!namespace,
                [className]: !!className,
            })}
            {...props}>
            {children}
        </div>
    );

export default forwardRef(Row);
