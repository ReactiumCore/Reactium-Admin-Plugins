import React, { useState } from 'react';
import { Dialog } from '@atomic-reactor/reactium-ui';
import { __, useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';

const noop = () => {};
const DragHandle = ({ bind = {} }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    return (
        <div className='list-drag-handle' {...bind}>
            <Icon name={'Linear.Move'} />
            <span className='sr-only'>{__('Click to Drag')}</span>
        </div>
    );
};

const ContentTypeMenuItem = props => {
    const menuItem = op.get(props, 'item', {});
    const item = op.get(props, 'item.item', {});
    const title = op.get(item, 'title', op.get(item, 'slug'));
    const onRemoveItem = op.get(props, 'onRemoveItem', noop);
    const animateResize = () =>
        op.get(props.listRef.current, 'animateResize', noop)();
    const [expanded, setExpanded] = useState(false);

    return (
        <Dialog
            className={'menu-item menu-item-content-type'}
            header={{
                title,
                elements: [
                    <DragHandle key='dh' bind={op.get(props, 'bind')} />,
                ],
            }}
            pref={`menu-item-${menuItem.id}`}
            dismissable={true}
            onDismiss={onRemoveItem(menuItem)}
            onCollapse={() => {
                setExpanded(false);
                _.defer(animateResize);
            }}
            onExpand={() => {
                setExpanded(true);
                _.defer(animateResize);
            }}
            expanded={expanded}>
            {menuItem.id}
        </Dialog>
    );
};

export default ContentTypeMenuItem;
