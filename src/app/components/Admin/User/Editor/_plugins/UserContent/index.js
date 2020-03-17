import React from 'react';
import _ from 'underscore';
import Empty from './Empty';
import op from 'object-path';
import { Button, Carousel, Icon, Slide } from '@atomic-reactor/reactium-ui';

const UserContent = ({ editor }) => {
    const { cx, isNew, state = {} } = editor;
    const { editing, value = {} } = state;
    const { meta = {} } = value;

    const isEmpty = () => {
        return Object.keys(op.get(meta, 'content')).length < 1;
    };

    const isVisible = () => {
        return !_.isEmpty(value) && !editing && !isNew();
    };

    const render = () => {
        return (
            <div className={cx('content')}>
                <Empty className={cx('content-empty')} editor={editor} />
            </div>
        );
    };

    return isVisible() ? render() : null;
};

export { UserContent, UserContent as default };
