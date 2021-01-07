import React from 'react';
import IconInput from './IconInput';
import ImageInput from './ImageInput';
import VideoInput from './VideoInput';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

const noop = () => {};

const typeFromName = (name, defaultType = 'text') => {
    let type = defaultType;

    name = String(name).toLowerCase();

    if (name.endsWith('color')) {
        type = 'color';
    }

    if (name.endsWith('icon')) {
        type = 'icon';
    }

    if (name.endsWith('image')) {
        type = 'image';
    }

    if (name.endsWith('video')) {
        type = 'video';
    }

    return type;
};

const AttributeInput = ({ onChange = noop, ...props }) => {
    const type = typeFromName(props.name, props.type);

    const ColorInput = useHookComponent('ColorPicker');

    let element = <input {...props} onChange={onChange} type={type} />;

    switch (type) {
        case 'color':
            element = <ColorInput {...props} onChange={onChange} />;
            break;

        case 'icon':
            element = <IconInput {...props} onChange={onChange} />;
            break;

        case 'image':
            element = <ImageInput {...props} onChange={onChange} />;
            break;

        case 'video':
            element = <VideoInput {...props} onChange={onChange} />;
            break;
    }

    Reactium.Hook.runSync('rte-attribute-input', element);

    return element;
};

export { AttributeInput, AttributeInput as default };
