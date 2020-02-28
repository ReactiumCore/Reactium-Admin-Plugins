import op from 'object-path';
import ENUMS from 'components/Admin/Content/enums';
import useRouteParams from '../_utils/useRouteParams';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import React, { useCallback, useEffect, useState } from 'react';

import {
    useAsyncEffect,
    useFulfilledObject,
    useHandle,
} from 'reactium-core/sdk';

const AddButton = ({ type }) => (
    <Button
        appearance='pill'
        className='mr-xs-24'
        color='primary'
        outline
        size='xs'
        to={`/admin/content/${type}/new`}
        type='link'>
        <Icon name='Feather.Plus' size={18} />
        <span className='hide-xs show-md ml-xs-12'>
            {ENUMS.TEXT.NEW} {type}
        </span>
    </Button>
);

const SaveButton = ({ Editor, type }) => {
    const [status, setStatus] = useState();
    const [updatedEditor, ready] = useFulfilledObject(Editor, ['EventForm']);

    const isBusy = useCallback(stat =>
        [
            Editor.EventForm.ENUMS.STATUS.SUBMITTING,
            Editor.EventForm.ENUMS.STATUS.VALIDATING,
        ].includes(stat),
    );

    const onStatus = e => {
        const newStatus = e.event;
        console.log(e);
        if (newStatus !== status) setStatus(newStatus);
    };

    useEffect(() => {
        if (ready !== true) return;
        Editor.addEventListener('status', onStatus);
        return () => {
            Editor.removeEventListener('status', onStatus);
        };
    }, [ready]);

    const render = () => {
        const busy = isBusy(status);
        const label = busy ? ENUMS.TEXT.SAVING : ENUMS.TEXT.SAVE;
        const icon = busy ? 'Feather.UploadCloud' : 'Feather.Check';
        return (
            <Button
                appearance='pill'
                className='mr-xs-24'
                color='primary'
                disabled={busy}
                onClick={() => Editor.submit()}
                size='xs'
                type='button'>
                <Icon name={icon} size={18} />
                <span className='hide-xs show-md ml-xs-12'>
                    {String(label).replace('%type', type)}
                </span>
            </Button>
        );
    };

    return ready !== true ? null : render();
};

export default () => {
    const { path, slug, type } = useRouteParams(['path', 'slug', 'type']);
    const visible = String(path).startsWith('/admin/content');
    const Editor = useHandle('AdminContentEditor');

    if (!visible) return null;
    return !slug ? (
        <AddButton type={type} />
    ) : Editor ? (
        <SaveButton type={type} Editor={Editor} />
    ) : null;
};
