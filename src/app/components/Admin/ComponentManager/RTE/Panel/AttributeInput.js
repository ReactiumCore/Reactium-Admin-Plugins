import React from 'react';
import IconInput from './IconInput';
import ImageInput from './ImageInput';
import VideoInput from './VideoInput';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

const noop = () => {};

const typeFromName = (name, defaultType = 'text') => {
    name = String(name).toLowerCase();

    let type = defaultType;

    if (name.startsWith('color')) {
        type = 'color';
    }

    if (name.startsWith('icon')) {
        type = 'icon';
    }

    if (name.startsWith('image')) {
        type = 'image';
    }

    if (name.startsWith('video')) {
        type = 'video';
    }

    if (name.startsWith('text')) {
        type = 'textarea';
    }

    if (name.endsWith('toggle')) {
        type = 'toggle';
    }

    if (name.endsWith('check') || name.endsWith('checkbox')) {
        type = 'checkbox';
    }

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

    if (name.endsWith('text')) {
        type = 'textarea';
    }

    if (name.endsWith('toggle')) {
        type = 'toggle';
    }

    if (name.endsWith('check') || name.endsWith('checkbox')) {
        type = 'checkbox';
    }

    return type;
};

const AttributeInput = ({ onChange = noop, ...props }) => {
    const checked = props.defaultValue === true;

    const type = typeFromName(props.name, props.type);

    const ColorInput = useHookComponent('ColorPicker');

    const { Checkbox, Toggle } = useHookComponent('ReactiumUI');

    const onToggle = e =>
        onChange({ target: { name: e.target.name, value: e.target.checked } });

    let element = <input {...props} onChange={onChange} type={type} />;

    switch (type) {
        case 'checkbox':
            element = (
                <Checkbox
                    {...props}
                    onChange={onToggle}
                    defaultValue={true}
                    defaultChecked={checked}
                    label={props.placeholder}
                />
            );
            break;

        case 'toggle':
            element = (
                <Toggle
                    {...props}
                    onChange={onToggle}
                    defaultValue={true}
                    defaultChecked={checked}
                    label={props.placeholder}
                />
            );
            break;

        case 'color':
            element = <ColorInput {...props} onChange={onChange} />;
            break;

        case 'icon':
            element = <IconInput {...props} onChange={onChange} />;
            break;

        case 'image':
            element = <ImageInput {...props} onChange={onChange} />;
            break;

        case 'textarea':
            element = <textarea {...props} onChange={onChange} rows={3} />;
            break;

        case 'video':
            element = <VideoInput {...props} onChange={onChange} />;
            break;
    }

    Reactium.Hook.runSync('rte-attribute-input', element, {
        ...props,
        onChange,
        type,
    });

    return element;
};

export { AttributeInput, AttributeInput as default };
