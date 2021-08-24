import op from 'object-path';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHandle } from 'reactium-core/sdk';
import React, { useCallback, useEffect, useState } from 'react';
import useRouteParams from 'reactium_modules/@atomic-reactor/reactium-admin-core/Tools/useRouteParams';

const AddButton = () => {
    return (
        <Button
            appearance='pill'
            className='mr-xs-24'
            color='primary'
            outline
            size='xs'
            to='/admin/user/new/edit'
            type='link'>
            <Icon name='Feather.Plus' size={18} />
            <span className='hide-xs show-md ml-xs-12'>{__('New User')}</span>
        </Button>
    );
};

const SaveButton = ({ type }) => {
    const editor = useHandle('AdminUserEditor');

    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState(false);

    const onStatus = e => {
        setBusy(editor.isBusy());
        setEditing(editor.state.editing);
    };

    useEffect(() => {
        editor.addEventListener('STATUS', onStatus);
        return () => {
            editor.removeEventListener('STATUS', onStatus);
        };
    }, [editor]);

    const render = () => {
        const label = busy ? __('Saving...') : __('Save User');
        const icon = busy ? 'Feather.UploadCloud' : 'Feather.Check';
        return (
            <Button
                appearance='pill'
                className='mr-xs-24'
                color='primary'
                disabled={busy || !editing}
                onClick={e => editor.submit(e)}
                size='xs'
                type='button'>
                <Icon name={icon} size={18} />
                <span
                    className='hide-xs show-md ml-xs-12'
                    style={{ minWidth: 56, textAlign: 'left' }}>
                    {label}
                </span>
            </Button>
        );
    };

    return render();
};

export default () => {
    const { path, id } = useRouteParams(['path', 'id']);
    const visible = String(path).startsWith('/admin/user');

    if (!visible) return null;
    return !id ? <AddButton /> : <SaveButton />;
};
