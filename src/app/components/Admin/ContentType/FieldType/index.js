import React, { useRef, useEffect, useState } from 'react';
import Reactium, { useHookComponent, useHandle } from 'reactium-core/sdk';
import op from 'object-path';
import cn from 'classnames';
import _ from 'underscore';
import { Draggable } from 'react-beautiful-dnd';
import { WebForm } from '@atomic-reactor/reactium-ui';
// import WebForm from 'components/Reactium-UI/WebForm';
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
    const index = op.get(props, 'order', 0);
    const type = op.get(props, 'type', 'text');
    const fieldTypeComponent = op.get(
        props,
        'fieldTypeComponent',
        `FieldType${type}`,
    );
    const formRef = useRef();
    const Type = useHookComponent(fieldTypeComponent, DragHandle);
    const handle = useHandle('ContentTypeEditor');

    const validator = (id, type) => async (value, valid, errors) => {
        const validated = {
            errors: { focus: null, fields: [], errors: [] },
        };

        const context = await Reactium.Hook.run(`field-type-validator-${id}`, {
            id,
            type,
            value,
            valid,
            errors,
        });

        const newErrors = op.get(context, 'errors', {});
        validated.valid = op.get(context, 'valid', true) && valid;
        validated.errors.errors = validated.errors.errors.concat(
            _.unique([
                ...op.get(errors, 'errors', []),
                ...op.get(newErrors, 'errors', []),
            ]),
        );
        validated.errors.fields = validated.errors.fields.concat(
            _.unique([
                ...op.get(errors, 'fields', []),
                ...op.get(newErrors, 'fields', []),
            ]),
        );

        await Reactium.Hook.run(`field-type-validated-${id}`, validated);

        return validated;
    };

    const onError = (id, type, ref) => async ({ errors, value }) => {
        await Reactium.Hook.run(`field-type-errors-${id}`, {
            errors,
            value,
            id,
            type,
            ref,
        });
    };

    const onBeforeSubmit = (id, type, ref) => async ({
        value,
        valid,
        errors,
    }) => {
        await Reactium.Hook.run(`field-type-before-submit-${id}`, {
            value,
            valid,
            errors,
            id,
            type,
            ref,
        });
    };

    const onSubmit = (id, type, ref) => async ({ value }) => {
        await Reactium.Hook.run(`field-type-submit-${id}`, {
            value,
            id,
            type,
            ref,
        });
    };

    const onChange = (id, type, ref) => async (e, value) => {
        await Reactium.Hook.run(`field-type-form-change-${id}`, {
            value,
            id,
            type,
            ref,
            target: e.target,
        });
    };

    useEffect(() => {
        const hooks = [
            Reactium.Hook.register(
                'content-type-validate-fields',
                async context => {
                    context[id] = await formRef.current.validate();
                    const { valid, errors } = context[id];

                    if (valid !== true) {
                        formRef.current.setState({ errors });
                        onError(
                            id,
                            type,
                            formRef,
                        )({ errors, value: formRef.current.getValue() });
                        return;
                    }
                },
            ),
        ];

        // allow control from parent
        handle.addFormRef(id, () => formRef.current);

        return () => {
            hooks.forEach(id => Reactium.Hook.unregister(id));
            handle.removeFormRef(id);
        };
    }, [id, formRef.current]);

    const required = _.uniq(
        _.compact(op.get(props, 'required', []).concat('fieldName')),
    );

    return (
        <Draggable draggableId={id} index={index}>
            {({ innerRef, draggableProps, dragHandleProps }) => (
                <WebForm
                    ref={formRef}
                    validator={validator(id, type)}
                    required={required}
                    showError={false}
                    onError={onError(id, type, formRef)}
                    onBeforeSubmit={onBeforeSubmit(id, type, formRef)}
                    onSubmit={onSubmit(id, type, formRef)}
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
                        <input type='hidden' name='fieldId' value={id} />
                        <input type='hidden' name='fieldType' value={type} />
                        <Type
                            {...props}
                            dragHandleProps={dragHandleProps}
                            DragHandle={() => (
                                <DragHandle dragHandleProps={dragHandleProps} />
                            )}
                            formRef={formRef}
                        />
                    </div>
                </WebForm>
            )}
        </Draggable>
    );
};

FieldType.propTypes = {
    required: PropTypes.array,
};

FieldType.defaultProps = {
    required: [],
};

export default FieldType;
