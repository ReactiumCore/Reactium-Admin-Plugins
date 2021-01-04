import React from 'react';
import op from 'object-path';
import IconInput from './IconInput';

const AttributeInput = ({ handle, ...props }) => {
    let type = 'text';

    const name = String(op.get(props, 'name')).toLowerCase();

    if (name.endsWith('icon')) {
        type = 'icon';
    }

    const setRef = key => elm => {
        if (!handle.refs) return;
        return handle.refs.set(`input.${key}`, elm);
    };

    switch (type) {
        case 'icon':
            return <IconInput handle={handle} {...props} />;

        default:
            return (
                <input
                    {...props}
                    type={type}
                    ref={setRef(name)}
                    onChange={e => handle.setValue(name, e.target.value)}
                />
            );
    }
};

export { AttributeInput, AttributeInput as default };
