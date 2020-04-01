import React, { useRef, useEffect, useState } from 'react';
import Reactium, { useHookComponent, useHandle } from 'reactium-core/sdk';
import op from 'object-path';
import cn from 'classnames';
import _ from 'underscore';
import { Draggable } from 'react-beautiful-dnd';
import { EventForm } from '@atomic-reactor/reactium-ui';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';

const DragHandle = props => (
    <div
        className='fieldtype-draggable'
        tabIndex={0}
        {...props.dragHandleProps}>
        <span className='sr-only'>Drag handle</span>
    </div>
);

const FieldType = props => {
    const id = op.get(props, 'id');
    const index = op.get(props, 'index', 0);
    const type = op.get(props, 'type', 'text');
    const [value, setValue] = useState({});
    const fieldTypeComponent = op.get(
        props,
        'fieldTypeComponent',
        `FieldType${type}`,
    );

    const formRef = useRef();
    const Type = useHookComponent(fieldTypeComponent, false);
    const CTE = useHandle('ContentTypeEditor');

    const validator = (id, type) => async validated => {
        await Reactium.Hook.run('field-type-validator', {
            id,
            type,
            validated,
        });

        return validated;
    };

    const onChange = (id, type, ref) => async e => {
        if (e.value) {
            const value = e.value;

            await Reactium.Hook.run(`field-type-form-change-${id}`, {
                value,
                id,
                type,
                ref,
                target: e.target,
            });

            setValue(value);
        }
    };

    useEffect(() => {
        const hooks = [
            Reactium.Hook.register(
                'content-type-validate-fields',
                async context => {
                    context[id] = await formRef.current.validate();
                },
            ),
        ];

        const ival = setInterval(() => {
            if (formRef.current) {
                clearInterval(ival);
                // allow control from parent
                CTE.addFormRef(id, () => formRef.current);
                const value = {
                    ...op.get(CTE.saved(), ['fields', id], {}),
                    ...op.get(CTE.getValue(), ['fields', id], {}),
                };

                formRef.current.setValue(value);
            }
        }, 1);

        return () => {
            hooks.forEach(id => Reactium.Hook.unregister(id));
            CTE.removeFormRef(id);
        };
    }, [id]);

    const required = _.uniq(
        _.compact(op.get(props, 'required', []).concat('fieldName')),
    );

    if (!id || !Type) return null;

    return (
        <Draggable draggableId={id} index={index}>
            {({ innerRef, draggableProps, dragHandleProps }) => (
                <EventForm
                    key={id}
                    value={value}
                    ref={formRef}
                    required={required}
                    validator={validator(id, type)}
                    onChange={onChange(id, type, formRef)}>
                    <div
                        ref={innerRef}
                        {...draggableProps}
                        className={cn(
                            'field-type-wrapper',
                            `field-type-wrapper-${type
                                .toLowerCase()
                                .replace(/\s+/g, '-')}`,
                        )}>
                        <Type
                            {...props}
                            dragHandleProps={dragHandleProps}
                            DragHandle={() => (
                                <DragHandle dragHandleProps={dragHandleProps} />
                            )}
                            formRef={formRef}
                        />
                    </div>
                </EventForm>
            )}
        </Draggable>
    );
};

FieldType.propTypes = {
    required: PropTypes.array,
};

FieldType.defaultProps = {
    required: ['fieldName'],
};

export default FieldType;
