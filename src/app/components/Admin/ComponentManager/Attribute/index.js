import React from 'react';
import op from 'object-path';
import { Draggable } from 'react-beautiful-dnd';
import { __, useHookComponent, useRefs } from 'reactium-core/sdk';

const noop = () => {};

const buttonStyle = {
    width: 41,
    height: 41,
    padding: 0,
};

const Wrap = ({ list, children, index, ...props }) =>
    list === true ? (
        <Draggable
            key={`attribute-${index}`}
            draggableId={`attribute-${index}`}
            index={index}>
            {provided => (
                <li {...provided.draggableProps} ref={provided.innerRef}>
                    <div className='attribute'>
                        {children}
                        <div
                            className='attribute-handle'
                            {...provided.dragHandleProps}
                            tabIndex={-1}
                        />
                    </div>
                </li>
            )}
        </Draggable>
    ) : (
        <div className='attribute' {...props}>
            {children}
        </div>
    );

export default props => {
    let {
        color,
        icon,
        index,
        label,
        name,
        onClick = noop,
        readOnly = false,
        type = null,
    } = props;

    const refs = useRefs();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const submit = e => {
        if (readOnly === true) return;
        onClick({ ...e, ...props, input: refs.get('input') });
    };

    const _onEnter = e => {
        if (readOnly) return;
        if (e.which !== 13) return;
        e.preventDefault();
        submit(e);
    };

    return (
        <Wrap index={index} list={type === 'list-item' || type === 'li'}>
            {label && <h3>{label}</h3>}
            <div className='input-group'>
                <input
                    data-index={op.get(props, 'index', 0) || 0}
                    defaultValue={op.get(props, 'value')}
                    ref={elm => refs.set('input', elm)}
                    placeholder={__('Attribute')}
                    onKeyDown={_onEnter}
                    readOnly={readOnly}
                    name={name}
                    type='text'
                />
                {readOnly !== true && (
                    <Button
                        type='button'
                        color={color}
                        onClick={submit}
                        readOnly={readOnly}
                        style={buttonStyle}>
                        <Icon name={icon} />
                    </Button>
                )}
            </div>
        </Wrap>
    );
};
