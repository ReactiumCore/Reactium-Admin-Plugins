import op from 'object-path';
import React, { useEffect, useState } from 'react';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';

const AddButton = () => {
    const { Button, Icon } = useHookComponent('ReactiumUI');

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

const SaveButton = () => {
    const editor = useHandle('AdminUserEditor');

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState(false);

    const onStatus = () => {
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
    const path = op.get(Reactium.Routing.currentRoute, 'match.route.path');
    const { id } = op.get(Reactium.Routing.currentRoute, 'params', {});
    const isVisible = () => String(path).startsWith('/admin/user');
    return !isVisible() ? null : !id ? <AddButton /> : <SaveButton />;
};
