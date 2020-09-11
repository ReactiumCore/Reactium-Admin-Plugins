import React from 'react';
import { useEditor } from 'slate-react';

export default props => {
    const { ID, children } = props;
    const editor = useEditor();

    return <span id={ID}>Tab {children}</span>;
};
