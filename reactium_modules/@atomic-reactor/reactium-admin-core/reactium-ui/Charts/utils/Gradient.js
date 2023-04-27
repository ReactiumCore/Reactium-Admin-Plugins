import React from 'react';
import uuid from 'uuid/v4';

const Gradient = ({
    color,
    id = uuid(),
    opacity = { top: 1, bottom: 0.25 },
}) => (
    <svg
        style={{
            position: 'absolute',
            width: 0,
            height: 0,
            top: -500000,
            left: -500000,
        }}>
        <defs>
            <linearGradient
                id={`${id}-gradient`}
                x1='0%'
                y1='0%'
                x2='0%'
                y2='100%'>
                <stop offset='0%' stopColor={color} stopOpacity={opacity.top} />
                <stop
                    offset='100%'
                    stopColor={color}
                    stopOpacity={opacity.bottom}
                />
            </linearGradient>
        </defs>
    </svg>
);

export { Gradient, Gradient as default };
