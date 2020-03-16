import React from 'react';
import _ from 'underscore';
import op from 'object-path';

const UserContent = ({ editor }) => {
    const { editing } = op.get(editor, 'state');
    const render = () => {
        return 'UGC';
    };

    return render();
};

export { UserContent, UserContent as default };
