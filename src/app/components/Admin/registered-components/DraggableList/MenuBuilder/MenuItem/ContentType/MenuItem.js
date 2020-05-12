import React from 'react';
import { Dialog } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import _ from 'underscore';

const noop = () => {};
const ContentTypeMenuItem = props => {
    const menuItem = op.get(props, 'item', {});
    const item = op.get(props, 'item.item', {});
    const title = op.get(item, 'title', op.get(item, 'slug'));
    const onRemoveItem = op.get(props, 'onRemoveItem', noop);
    const animateResize = () =>
        op.get(props.listRef.current, 'animateResize', noop)();
    console.log({ animateResize });

    return (
        <Dialog
            className={'menu-item menu-item-content-type'}
            header={{ title }}
            pref={`menu-item-${menuItem.id}`}
            dismissable={true}
            onDismiss={onRemoveItem(menuItem)}
            onCollapse={() => _.defer(animateResize)}
            onExpand={() => _.defer(animateResize)}>
            {menuItem.id}
        </Dialog>
    );
};

export default ContentTypeMenuItem;
