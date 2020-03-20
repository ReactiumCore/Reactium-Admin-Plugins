import React from 'react';
import _ from 'underscore';
import Empty from './Empty';
import Media from './Media';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';

const UserMedia = ({ editor }) => {
    const Helmet = useHookComponent('Helmet');

    const { cx, isNew, state = {} } = editor;
    const { editing, tab, value = {} } = state;
    const { meta = {} } = value;

    const isEmpty = () => _.isEmpty(op.get(meta, 'media', {}));

    const isVisible = () => !editing && !isNew() && tab === 'media';

    const title = __('User Media');

    const render = () => {
        return (
            <div className={cx('media')}>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                {isEmpty() ? (
                    <Empty className={cx('media-empty')} editor={editor} />
                ) : (
                    <Media editor={editor} data={op.get(meta, 'media', {})} />
                )}
            </div>
        );
    };

    return isVisible() ? render() : null;
};

export { UserMedia, UserMedia as default };
