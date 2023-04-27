import React from 'react';
import ReactDOM from 'react-dom';

export default ({ children, target }) => {
    return typeof document !== 'undefined'
        ? ReactDOM.createPortal(children, target || document.body)
        : children;
};
