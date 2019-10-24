import React from 'react';

const Logo = ({ width = 40, height = 40, props }) => (
    <svg width={width} height={height} viewBox='0 0 70 70' {...props}>
        <mask id='a'>
            <path fill='#fff' d='M0 0h70v70H0z'></path>
            <g stroke='#000' strokeWidth='8'>
                <path
                    id='b'
                    fill='#4F82BA'
                    d='M0 70l30-50 10 13L70 0 40 50 30 37 0 70z'></path>
            </g>
        </mask>
        <circle
            mask='url(#a)'
            fill='none'
            stroke='#000'
            strokeWidth='8'
            cx='35'
            cy='35'
            r='30'></circle>
        <use xlinkHref='#b' fill='#4F82BA'></use>
    </svg>
);

export default Logo;
