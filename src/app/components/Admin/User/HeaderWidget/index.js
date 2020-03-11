import op from 'object-path';
import { __ } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import React, { useCallback, useEffect, useState } from 'react';
import useRouteParams from 'components/Admin/Tools/useRouteParams';

import Reactium, {
    useAsyncEffect,
    useFulfilledObject,
    useHandle,
} from 'reactium-core/sdk';

const AddButton = () => {
    return (
        <Button
            appearance='pill'
            className='mr-xs-24'
            color='primary'
            outline
            size='xs'
            to={`/admin/user/new`}
            type='link'>
            <Icon name='Feather.Plus' size={18} />
            <span className='hide-xs show-md ml-xs-12'>{__('New User')}</span>
        </Button>
    );
};

const SaveButton = ({ type }) => {
    return null;
    // const [status, setStatus] = useState();
    // const Editor = useHandle('AdminContentEditor');
    // const [ready] = useFulfilledObject(Editor, ['EventForm']);
    //
    // const isBusy = stat =>
    //     [
    //         Editor.EventForm.ENUMS.STATUS.SUBMITTING,
    //         Editor.EventForm.ENUMS.STATUS.VALIDATING,
    //     ].includes(stat);
    //
    // const onStatus = e => {
    //     const newStatus = e.event;
    //     if (newStatus !== status) setStatus(newStatus);
    // };
    //
    // useEffect(() => {
    //     if (ready !== true) return;
    //     Editor.addEventListener('status', onStatus);
    //     return () => {
    //         Editor.removeEventListener('status', onStatus);
    //     };
    // }, [ready]);
    //
    // const render = () => {
    //     const busy = isBusy(status);
    //     const label = busy ? ENUMS.TEXT.SAVING : ENUMS.TEXT.SAVE;
    //     const icon = busy ? 'Feather.UploadCloud' : 'Feather.Check';
    //     return (
    //         <Button
    //             appearance='pill'
    //             className='mr-xs-24'
    //             color='primary'
    //             disabled={busy}
    //             onClick={e => Editor.submit(e)}
    //             size='xs'
    //             type='button'>
    //             <Icon name={icon} size={18} />
    //             <span className='hide-xs show-md ml-xs-12'>
    //                 {String(label).replace('%type', type)}
    //             </span>
    //         </Button>
    //     );
    // };
    //
    // return ready !== true ? null : render();
};

export default () => {
    const { path, id } = useRouteParams(['path', 'id']);
    const visible = String(path).startsWith('/admin/user');

    if (!visible) return null;
    return !id ? <AddButton /> : <SaveButton />;
};
