import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect } from 'react';
import { ReactEditor, useEditor } from 'slate-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Reactium, {
    __,
    useDerivedState,
    useFocusEffect,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

const CloseButton = props => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button
            size={Button.ENUMS.SIZE.XS}
            color={Button.ENUMS.COLOR.CLEAR}
            className='ar-dialog-header-btn dismiss'
            {...props}>
            <Icon name='Feather.X' />
        </Button>
    );
};

export default props => {
    const { title = __('Tabs') } = props;
    const refs = useRefs();
    const editor = useEditor();

    const [state, update] = useDerivedState({
        tabs: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    });

    const setState = newState => {
        if (unMounted()) return;

        update(newState);
    };

    const { Button, Dialog, EventForm, Icon } = useHookComponent('ReactiumUI');

    const cx = Reactium.Utils.cxFactory('rte-tabs-editor');

    const hide = () => {
        editor.panel.hide(false, true).setID('rte-panel');
        ReactEditor.focus(editor);
    };

    const header = () => ({
        elements: [<CloseButton onClick={hide} key='close-btn' />],
        title,
    });

    const unMounted = () => !refs.get('dialog');

    const _onAdd = e => {
        if (e.type === 'keydown') {
            if (e.keyCode !== 13) return;
            e.preventDefault();
        }

        const input = refs.get('add');
        if (!input) return;

        const tab = String(input.value);
        let { tabs = [] } = state;

        if (tabs.includes(tab)) {
            input.focus();
            return;
        }

        tabs = _.chain([state.tabs, tab])
            .flatten()
            .uniq()
            .compact()
            .value();

        input.value = '';
        input.focus();

        setState({ tabs });
    };

    const _onChange = e => {
        const index = e.currentTarget.dataset.index;
        const value = e.currentTarget.value;
        let { tabs = [] } = state;

        tabs.splice(index, 1, value);

        setState({ tabs });
    };

    const _onDelete = (index = 0) => {
        const { tabs = [] } = state;
        tabs.splice(index, 1);
        setState({ tabs: state.tabs });
    };

    const _onReorder = e => {
        const { tabs = [] } = state;

        const endIndex = op.get(e, 'destination.index');
        if (typeof endIndex === 'undefined') return;

        const startIndex = op.get(e, 'source.index');
        const [item] = tabs.splice(startIndex, 1);

        tabs.splice(endIndex, 0, item);
        setState({ tabs });
    };

    const _onSubmit = ({ value }) => {
        const { tabs } = value;
        console.log(tabs);
        hide();
    };

    useFocusEffect(editor.panel.container);

    useEffect(() => {
        const form = refs.get('form');
        if (!form) return;

        const { tabs } = state;

        form.setValue({ tabs });
    }, [state.tabs]);

    const renderDraggable = (tag, i) => (
        <Draggable
            key={`tab-group-${i}`}
            draggableId={`tab-group-${i}`}
            index={i}>
            {(provided, snapshot) => {
                if (snapshot.isDragging) {
                    const offset = editor.panel.position;
                    const x =
                        op.get(provided.draggableProps.style, 'left') -
                        offset.x;
                    const y =
                        op.get(provided.draggableProps.style, 'top') - offset.y;
                    op.set(provided.draggableProps.style, 'left', x);
                    op.set(provided.draggableProps.style, 'top', y);
                }

                return (
                    <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className={cn('draggable', {
                            dragging: snapshot.isDragging,
                        })}>
                        {provided.placeholder}
                        <div className='input-group'>
                            <input
                                type='text'
                                name='tabs'
                                value={tag}
                                onChange={_onChange}
                            />
                            <Button
                                onClick={() => _onDelete(i)}
                                style={{
                                    width: 41,
                                    height: 41,
                                    padding: 0,
                                }}
                                color={Button.ENUMS.COLOR.DANGER}>
                                <Icon name='Feather.X' />
                            </Button>
                        </div>
                    </div>
                );
            }}
        </Draggable>
    );

    return (
        <Dialog
            collapsible={false}
            dismissable={false}
            header={header()}
            ref={elm => refs.set('dialog', elm)}>
            <EventForm
                className={cx()}
                onSubmit={_onSubmit}
                value={{ tabs: state.tabs }}
                ref={elm => refs.set('form', elm)}>
                <div className={cx('add')}>
                    <div className='input-group'>
                        <input
                            type='text'
                            ref={elm => refs.set('add', elm)}
                            placeholder={__('Tab Name')}
                            onKeyDown={_onAdd}
                        />
                        <Button
                            style={{ width: 41, height: 41, padding: 0 }}
                            onClick={_onAdd}
                            type='button'>
                            <Icon name='Feather.Plus' />
                        </Button>
                    </div>
                </div>
                {state.tabs.length > 0 && (
                    <DragDropContext onDragEnd={_onReorder}>
                        <Droppable droppableId={uuid()} direction='vertical'>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    className={cn(cx('tabs'), {
                                        dragging:
                                            snapshot.isDraggingOver ||
                                            snapshot.draggingFromThisWith,
                                    })}
                                    ref={provided.innerRef}>
                                    {state.tabs.map(renderDraggable)}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
                {state.tabs.length > 0 && (
                    <div className={cx('footer')}>
                        <Button block type='submit' size={Button.ENUMS.SIZE.MD}>
                            {__('Insert Tabs')}
                        </Button>
                    </div>
                )}
            </EventForm>
        </Dialog>
    );
};
