import React from 'react';
import op from 'object-path';
import camelcase from 'camelcase';
import Reactium, { useDerivedState, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const { Modal, insert, shortcode } = props;

    const { Dialog, Button, EventForm } = useHookComponent('ReactiumUI');

    const type = Reactium.Shortcode.Component.get(shortcode.type);

    const typeLabel = [
        shortcode.code,
        op.get(type, 'label', camelcase(type.id, { pascalCase: true })),
    ].join(' - ');

    const attributes = Object.entries(op.get(type, 'attributes', {})).map(
        ([key, value]) => {
            value['id'] = key;
            return value;
        },
    );

    const onDismiss = () => Modal.dismiss();

    const onSubmit = e => {
        shortcode.attributes = e.value;
        insert(shortcode);
        Modal.dismiss();
    };

    const footer = {
        align: Dialog.ENUMS.ALIGN.RIGHT,
        elements: [
            <Button
                type={Button.ENUMS.TYPE.BUTTON}
                onClick={onDismiss}
                className='mr-xs-8'
                color={Button.ENUMS.COLOR.DANGER}>
                Cancel
            </Button>,
            <Button type={Button.ENUMS.TYPE.SUBMIT}>Insert</Button>,
        ],
    };

    return (
        <EventForm onSubmit={onSubmit}>
            <Dialog
                collapsible={false}
                dismissable={true}
                footer={footer}
                header={{ title: typeLabel }}
                onDismiss={onDismiss}>
                <div className='shortcodes-rte-attributes'>
                    {attributes.map(item => (
                        <Attribute key={item.id} {...item} />
                    ))}
                </div>
            </Dialog>
        </EventForm>
    );
};

const Attribute = ({ id, label, type, value, ...props }) => {
    label = label || `${camelcase(id, { pascalCase: true })}:`;

    let Element;

    switch (type) {
        case 'textarea':
            Element = props => (
                <label>
                    <span>{label}</span>
                    <textarea {...props} />
                </label>
            );
            break;

        default:
            Element = props => (
                <label>
                    <span>{label}</span>
                    <input type={type} {...props} />
                </label>
            );
    }

    return (
        <div className='form-group'>
            <Element {...props} name={id} id={id} />
        </div>
    );
};
