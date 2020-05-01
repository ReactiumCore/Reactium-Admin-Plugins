import React from 'react';
import { Dialog } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import _ from 'underscore';

const ContentTypeMenuItem = props => {
    const item = op.get(props, 'item.item', {});
    const title = op.get(item, 'title', op.get(item, 'slug'));
    console.log({ item });
    return (
        <Dialog
            className={'menu-item menu-item-content-type'}
            header={{ title }}
            pref={`menu-item-${props.id}`}
            dismissable={true}>
            {item.id}
        </Dialog>
    );
};

export default ContentTypeMenuItem;
