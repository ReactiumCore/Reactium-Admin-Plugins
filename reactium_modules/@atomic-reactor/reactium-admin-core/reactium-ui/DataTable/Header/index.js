import React from 'react';

const Header = ({ children, namespace }) =>
    !children ? null : <div className={`${namespace}-header`}>{children}</div>;

export default Header;
