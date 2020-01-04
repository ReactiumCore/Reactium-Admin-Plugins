import React from 'react';
import { WebForm } from '@atomic-reactor/reactium-ui';
import TypeName from './TypeName';
import Fields from './Fields';
import Tools from './Tools';
import { useDerivedState, Zone } from 'reactium-core/sdk';
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

    return (
        <div className={cn('type-editor', slugify(`type-editor ${id}`))}>
            <WebForm onSubmit={onSubmit}>
                <TypeName id={id} />
                <DragDropContext onDragEnd={onDragEnd}>
                    <Fields />
                    <Tools enums={Enums} />
                </DragDropContext>
            </WebForm>
        </div>
    );
};

export default ContentType;
