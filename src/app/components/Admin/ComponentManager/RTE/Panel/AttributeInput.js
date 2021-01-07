import React from 'react';
import op from 'object-path';
import IconInput from './IconInput';
import ImageInput from './ImageInput';
import { useHookComponent } from 'reactium-core/sdk';

const AttributeInput = ({ handle, ...props }) => {
    let type = 'text';

    const name = String(op.get(props, 'name')).toLowerCase();

    const ColorInput = useHookComponent('ColorPicker');

    if (name.endsWith('color')) {
        type = 'color';
    }

    if (name.endsWith('icon')) {
        type = 'icon';
    }

    if (name.endsWith('image')) {
        type = 'image';
    }

    const setRef = key => elm => {
        if (!handle.refs) return;
        return handle.refs.set(`input.${key}`, elm);
    };

    switch (type) {
        case 'color':
            return (
                <ColorInput
                    {...props}
                    onChange={e => handle.setValue(props.name, e.target.value)}
                />
            );

        case 'icon':
            return <IconInput handle={handle} {...props} />;

        case 'image':
            return (
                <ImageInput
                    {...props}
                    onChange={e => handle.setValue(props.name, e.target.value)}
                />
            );

        default:
            return (
                <input
                    {...props}
                    type={type}
                    ref={setRef(name)}
                    onChange={e => handle.setValue(props.name, e.target.value)}
                />
            );
    }
};

export { AttributeInput, AttributeInput as default };
