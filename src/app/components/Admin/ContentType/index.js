import React, { useRef, useState } from 'react';
import TypeName from './TypeName';
import Fields from './Fields';
import Tools from './Tools';
import Reactium, {
    useDerivedState,
    useRegisterHandle,
} from 'reactium-core/sdk';
import { WebForm } from '@atomic-reactor/reactium-ui';
import cn from 'classnames';
import slugify from 'slugify';
import op from 'object-path';
import { DragDropContext } from 'react-beautiful-dnd';
import uuid from 'uuid/v4';

const noop = () => {};
const getStubRef = () => ({ getValue: () => ({}), update: noop });

const ContentType = props => {
    const [state, setState] = useDerivedState(props, ['params.id']);
    const id = op.get(state, 'params.id', 'new');
    const Enums = op.get(state, 'Enums', {});
    const parentFormRef = useRef();
    const formsRef = useRef({});
    const formsErrors = useRef({});
    const nameError = useRef(false);
    const [, setVersion] = useState(uuid());

    const getValue = () => {
        const currentValue = {};
        op.set(
            currentValue,
            'type',
            op.get(parentFormRef.current.getValue(), 'type'),
        );
        Reactium.Zone.getZoneComponents(Enums.ZONE).map(({ id: fieldId }) => {
            const ref = op.get(formsRef.current, [fieldId], getStubRef)();
            op.set(currentValue, ['fields', fieldId], ref.getValue());
        });

        return currentValue;
    };

    const setValue = value => {
        parentFormRef.current.update(value);
        Object.entries(
            op.get(value, 'fields', {}),
        ).forEach(([fieldId, value]) => getFormRef(fieldId).update(value));
    };

    const validator = async (value, valid, errors) => {
        formsErrors.current = {};

        const responseContext = await Reactium.Hook.run(
            'content-type-validate-fields',
        );

        for (let { id: fieldId } of Reactium.Zone.getZoneComponents(
            Enums.ZONE,
        )) {
            if (op.get(responseContext, [fieldId, 'valid'], true) !== true) {
                op.set(
                    formsErrors.current,
                    [fieldId],
                    op.get(responseContext, [fieldId]),
                );

                const ref = op.get(formsRef.current, [fieldId], getStubRef)();
                ref.setState(op.get(responseContext, [fieldId]));
                valid = false;
            }
        }

        return { valid, errors };
    };

    const onError = async ({ errors }) => {
        if (op.get(errors, 'fields', []).includes('type')) {
            nameError.current = true;
        } else {
            nameError.current = false;
        }

        updateRestore(value => {
            // render errors
            setVersion(uuid());
        });
    };

    const updateRestore = async (cb = noop) => {
        // preserve values
        const value = getValue();

        await cb(value);

        // put values back in form
        setValue(value);

        return value;
    };

    const onTypeSave = async () => {
        updateRestore(value => {
            // render errors
            setVersion(uuid());
            console.log('onTypeSave', { value });
        });
    };

    const saveField = (id, value) => {
        setState; // TODO save state here, and interact with SDK
        console.log({ id, value });
    };

    const addFormRef = (id, cb) => {
        formsRef.current[id] = cb;
    };

    const removeFormRef = id => {
        op.del(formsRef.current, [id]);
    };

    const onDragEnd = result => {
        const draggableId = op.get(result, 'draggableId');
        const source = op.get(result, 'source.index');
        const destination = op.get(result, 'destination.index');
        if (source === destination) return;

        const fieldIds = Reactium.Zone.getZoneComponents(Enums.ZONE).map(
            ({ id }) => id,
        );
        fieldIds.splice(source, 1);
        fieldIds.splice(destination, 0, draggableId);
        fieldIds.forEach((id, order) =>
            Reactium.Zone.updateComponent(id, { order }),
        );
    };

    const addField = type => {
        if (op.has(Enums, ['TYPES', type])) {
            updateRestore(
                value =>
                    new Promise(resolve => {
                        const existing = Reactium.Zone.getZoneComponents(
                            Enums.ZONE,
                        );
                        Reactium.Zone.addComponent({
                            ...Enums.TYPES[type],
                            zone: Enums.ZONE,
                            order: existing.length,
                            component: 'FieldType',
                            fieldTypeComponent: Enums.TYPES[type].component,
                        });

                        setTimeout(() => {
                            resolve();
                        }, 1);
                    }),
            );
        }
    };

    const removeField = id => {
        // Make async so dismissable _onHide() reconciles before removing component
        updateRestore(
            value =>
                new Promise(resolve => {
                    setTimeout(() => {
                        Reactium.Zone.removeComponent(id);
                        op.del(formsRef.current, [id]);
                        resolve();
                    }, 1);
                }),
        );
    };

    const getFormRef = id => op.get(formsRef.current, [id], getStubRef)();

    const getFormErrors = id => op.get(formsErrors.current, [id, 'errors']);

    useRegisterHandle(
        'ContentTypeEditor',
        () => {
            return {
                addField,
                removeField,
                saveField,
                addFormRef,
                removeFormRef,
                getFormRef,
                getFormErrors,
            };
        },
        [],
    );

    return (
        <div className={cn('type-editor', slugify(`type-editor ${id}`))}>
            <WebForm
                ref={parentFormRef}
                onSubmit={onTypeSave}
                onError={onError}
                required={['type']}
                showError={false}
                validator={validator}>
                <TypeName id={id} error={nameError.current} />
            </WebForm>

            <DragDropContext onDragEnd={onDragEnd}>
                <Fields />
            </DragDropContext>
            <Tools enums={Enums} />
        </div>
    );
};

export default ContentType;
