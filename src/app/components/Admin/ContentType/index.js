import React from 'react';
import { WebForm } from '@atomic-reactor/reactium-ui';
import TypeName from './TypeName';
import Fields from './Fields';
import Tools from './Tools';
import Reactium, {
    useDerivedState,
    useRegisterHandle,
    Zone,
} from 'reactium-core/sdk';
import cn from 'classnames';
import slugify from 'slugify';
import op from 'object-path';
import { DragDropContext } from 'react-beautiful-dnd';

const ContentType = props => {
    const [state, setState] = useDerivedState(props, ['params.id']);
    const id = op.get(state, 'params.id', 'new');
    const Enums = op.get(state, 'Enums', {});

    const onSubmit = ({ value }) => {
        console.log({ value });
    };

    const onDragEnd = result => {
        console.log({ result });
    };

    const addField = type => {
        if (op.has(Enums, ['TYPES', type])) {
            const existing = Reactium.Zone.getZoneComponents(Enums.ZONE);
            Reactium.Zone.addComponent({
                ...Enums.TYPES[type],
                zone: Enums.ZONE,
                order: existing.length + 1,
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
        }, 1);
    };

    useRegisterHandle(
        'ContentTypeEditor',
        () => {
            return {
                addField,
                removeField,
            };
        },
        [],
    );

    return (
        <div className={cn('type-editor', slugify(`type-editor ${id}`))}>
            <WebForm onSubmit={onSubmit}>
                <TypeName id={id} />
                <DragDropContext onDragEnd={onDragEnd}>
                    <Fields />
                </DragDropContext>
                <Tools enums={Enums} />
            </WebForm>
        </div>
    );
};

export default ContentType;
