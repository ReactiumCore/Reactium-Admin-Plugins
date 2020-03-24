import _ from 'underscore';
import Empty from './Empty';
import op from 'object-path';
import Media from 'components/Admin/Media/List';
import React, { useEffect, useState } from 'react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const UserMedia = ({ editor }) => {
    const Helmet = useHookComponent('Helmet');

    const { cx, isNew, setState, state = {}, unMounted } = editor;
    const { editing, tab, value = {} } = state;
    const { meta = {} } = value;

    const isEmpty = () => _.isEmpty(op.get(meta, 'media', {}));

    const isVisible = () => !isNew() && tab === 'media';

    const title = __('User Media');

    const emptyClassName = cx('media-empty');

    const onMediaDelete = e => {
        if (unMounted()) return;

        const { objectId } = e;
        const newMeta = { ...meta };
        op.del(newMeta, ['media', objectId]);
        const newValue = { ...value, meta: newMeta };
        const newState = { value: newValue };
        setState(newState);
    };

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

    useEffect(() => {
        const deleteHook = Reactium.Hook.register(
            'media-delete',
            onMediaDelete,
        );
        return () => {
            Reactium.Hook.unregister(deleteHook);
        };
    }, []);

    return isVisible() ? render() : null;
};

export { UserMedia, UserMedia as default };
