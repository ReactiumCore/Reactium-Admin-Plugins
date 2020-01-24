import React from 'react';
import ReactDOM from 'react-dom';

export default ({ children }) => {
    return typeof document !== 'undefined'
        ? ReactDOM.createPortal(children, document.body)
        : children;
};
