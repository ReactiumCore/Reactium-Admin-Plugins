import React from 'react';
import _ from 'underscore';
import Empty from './Empty';
import op from 'object-path';
import Media from 'components/Admin/Media/List';
import { __, useHookComponent } from 'reactium-core/sdk';

const UserMedia = ({ editor }) => {
    const Helmet = useHookComponent('Helmet');

    const { cx, isNew, state = {} } = editor;
    const { editing, tab, value = {} } = state;
    const { meta = {} } = value;

    const isEmpty = () => _.isEmpty(op.get(meta, 'media', {}));

    const isVisible = () => !editing && !isNew() && tab === 'media';

    const title = __('User Media');

    const emptyClassName = cx('media-empty');

    const render = () => {
        return (
            <div className={cx('media')}>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <Media
                    data={op.get(meta, 'media', {})}
                    empty={isEmpty()}
                    emptyComponent={<Empty value={value} />}
                />
            </div>
        );
    };

    return isVisible() ? render() : null;
};

export { UserMedia, UserMedia as default };
