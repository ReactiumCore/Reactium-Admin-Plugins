import React, { useRef } from 'react';
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

const getStubRef = () => ({ getValue: () => ({}) });

const ContentType = props => {
    const [state, setState] = useDerivedState(props, ['params.id']);
    const id = op.get(state, 'params.id', 'new');
    const Enums = op.get(state, 'Enums', {});
    const parentFormRef = useRef();
    const formsRef = useRef({});
    const formsErrors = useRef({});

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

    const onTypeSave = async ({ value }) => {
        console.log('all values', getValue());
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
            const existing = Reactium.Zone.getZoneComponents(Enums.ZONE);
            Reactium.Zone.addComponent({
                ...Enums.TYPES[type],
                zone: Enums.ZONE,
                order: existing.length,
                component: 'FieldType',
                fieldTypeComponent: Enums.TYPES[type].component,
            });
        }
    };

    const removeField = id => {
        const existing = Reactium.Zone.getZoneComponents(Enums.ZONE);

        // Make async so dismissable _onHide() reconciles before removing component
        setTimeout(() => {
            Reactium.Zone.removeComponent(id);
            op.del(formsRef.current, [id]);
        }, 1);
    };

    const getFormRef = id => op.get(formsRef.current, [id], getStubRef)();

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
            };
        },
        [],
    );

    return (
        <div className={cn('type-editor', slugify(`type-editor ${id}`))}>
            <WebForm
                ref={parentFormRef}
                onSubmit={onTypeSave}
                required={['type']}
                showError={false}
                validator={validator}>
                <TypeName id={id} />
            </WebForm>

            <DragDropContext onDragEnd={onDragEnd}>
                <Fields />
            </DragDropContext>
            <Tools enums={Enums} />
        </div>
    );
};

export default ContentType;
