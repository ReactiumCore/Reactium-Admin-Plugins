import React from 'react';

const Footer = ({ children, namespace }) =>
    !children ? null : <div className={`${namespace}-footer`}>{children}</div>;

export default Footer;
