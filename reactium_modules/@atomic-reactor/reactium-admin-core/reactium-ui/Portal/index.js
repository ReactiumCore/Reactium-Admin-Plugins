import React from 'react';
import ReactDOM from 'react-dom';

const Portal = ({ children }) => {
    return typeof document !== 'undefined'
        ? ReactDOM.createPortal(children, document.body)
        : children;
};

export { Portal, Portal as default };
