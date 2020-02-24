import React from 'react';
import PropTypes from 'prop-types';
import { Zone } from 'reactium-core/sdk';

const Wrap = ({ href, children }) => {
    return href ? <a href={href}>{children}</a> : children;
};

const Logo = ({ width, height, children, className, href, zone, ...props }) => (
    <span className={className}>
        {zone && <Zone zone={zone} />}
        {children}
        <Wrap href={href}>
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
        </Wrap>
    </span>
);

Logo.propTypes = {
    className: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    href: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    zone: PropTypes.string,
};

Logo.defaultProps = {
    height: 40,
    width: 40,
    zone: 'admin-header-right',
};

export default Logo;
