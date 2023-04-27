import Row from '../Row';
import React from 'react';
import uuid from 'uuid/v4';
import cn from 'classnames';
import ENUMS from '../enums';
import Column from '../Column';
import { Feather } from 'reactium-ui/Icon';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const getRows = ({
    columns = {},
    data = [],
    selection = [],
    id,
    multiselect,
    namespace,
    reorderable = false,
    rowsPerPage = -1,
    selectable = false,
    state,
    onToggle,
    ...props
}) => {
    const { page = 1 } = state;
    const { provided } = props;

    if (data.length < 1) {
        return [];
    }

    const limit = Math.max(0, rowsPerPage);
    const idx = page > 1 ? page * limit - limit : 0;
    const selectStyle = reorderable ? { padding: '0 8px 0 4px' } : null;

    return selection.map((item, i) => {
        const itemTmp = { ...item };
        const index = page > 1 ? idx + i : i;
        let { selected = false, value } = itemTmp;

        value = value || index;

        delete itemTmp.selected;

        return (
            <Row key={`${id}-row-${i}`} selectable={selectable}>
                {selectable === true && (
                    <Column
                        i={i + 1}
                        field={`${id}-row-col-select`}
                        key={`${id}-row-col-select`}
                        className={`${namespace}-select`}
                        width={30}
                        style={selectStyle}
                        verticalAlign={ENUMS.VERTICAL_ALIGN.MIDDLE}>
                        <input
                            key={`${id}-checkbox-${i}`}
                            type={multiselect === true ? 'checkbox' : 'radio'}
                            name='selected'
                            data-index={index}
                            value={value}
                            checked={selected}
                            onChange={e => onToggle(e)}
                        />
                        <span className='box'>
                            <Feather.Check width={15} height={15} />
                        </span>
                    </Column>
                )}
                {Object.keys(columns).map(key => {
                    let value = itemTmp[key];
                    const col = { ...columns[key], field: key };
                    delete col.label;

                    return (
                        <Column
                            key={`${id}-row-${i}-col-${key}`}
                            {...col}
                            i={i + 1}>
                            {value}
                        </Column>
                    );
                })}
                {reorderable === true && (
                    <Column
                        i={i + 1}
                        field={`${id}-row-col-handle`}
                        provided={provided}
                        verticalAlign={ENUMS.VERTICAL_ALIGN.MIDDLE}
                        style={{ padding: 0, order: -1 }}
                        className={`${namespace}-handle`}
                        key={`${id}-row-${i}-col-handle`}
                        width={40}>
                        <div className='drag-handle'>
                            <Feather.MoreVertical width={10} height={10} />
                        </div>
                    </Column>
                )}
            </Row>
        );
    });
};

const DefaultRows = props => {
    const { namespace } = props;
    return (
        <div className={`${namespace}-rows`}>
            {getRows(props).map(item => item)}
        </div>
    );
};

const ReorderRows = props => {
    const { namespace, onReorder, selection = [] } = props;

    const renderDragable = (item, index) => (
        <Draggable key={item.id} draggableId={item.id} index={index}>
            {(provided, snapshot) => {
                const rows = getRows({ ...props, provided });
                const rowProps = rows[index].props;

                let { className = null } = rowProps;

                className = cn({
                    [className]: !!className,
                    dragging: snapshot.isDragging,
                });

                return React.cloneElement(rows[index], {
                    ...rowProps,
                    className,
                    ref: provided.innerRef,
                    ...provided.draggableProps,
                });
            }}
        </Draggable>
    );

    const render = () => (
        <DragDropContext onDragEnd={onReorder}>
            <Droppable droppableId={uuid()}>
                {(provided, snapshot) => (
                    <div
                        className={cn({
                            [`${namespace}-dnd`]: true,
                            dropping: snapshot.isDraggingOver,
                        })}
                        {...provided.droppableProps}
                        ref={provided.innerRef}>
                        {selection.map(renderDragable)}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );

    return render();
};

const Rows = ({ reorderable = false, ...props }) =>
    reorderable === true ? (
        <ReorderRows {...props} reorderable={true} />
    ) : (
        <DefaultRows {...props} />
    );

export default Rows;
