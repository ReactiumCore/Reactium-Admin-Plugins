import React from 'react';
import _ from 'underscore';
import Empty from './Empty';
import op from 'object-path';
import Content from './Content';
import { __, useHookComponent } from '@atomic-reactor/reactium-core/sdk';

const UserContent = ({ editor }) => {
    const Helmet = useHookComponent('Helmet');

    const { cx, isNew, state = {} } = editor;
    const { editing, tab, value = {} } = state;
    const { meta = {} } = value;

    const isEmpty = () => _.isEmpty(op.get(meta, 'content', {}));

    const isVisible = () => !isNew() && tab === 'content';

    const title = __('User Content');

    const render = () => {
        return (
            <div className={cx('content')}>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                {isEmpty() && <Empty value={value} />}
                {!isEmpty() && (
                    <Content
                        editor={editor}
                        data={op.get(meta, 'content', {})}
                    />
                )}
            </div>
        );
    };

    return isVisible() ? render() : null;
};

export { UserContent, UserContent as default };
