import React from 'react';
import _ from 'underscore';
import Empty from './Empty';
import op from 'object-path';
import Content from './Content';

const UserContent = ({ editor }) => {
    const { cx, isNew, state = {} } = editor;
    const { editing, value = {} } = state;
    const { meta = {} } = value;

    const isEmpty = () => {
        return (
            _.isEmpty(op.get(meta, 'content', {})) &&
            _.isEmpty(op.get(meta, 'media', {}))
        );
    };

    const isVisible = () => !_.isEmpty(value) && !editing && !isNew();

    const render = () => {
        return (
            <div className={cx('content')}>
                {isEmpty() && (
                    <Empty className={cx('content-empty')} editor={editor} />
                )}
                <Content editor={editor} data={op.get(meta, 'content', {})} />
            </div>
        );
    };

    return isVisible() ? render() : null;
};

export { UserContent, UserContent as default };
