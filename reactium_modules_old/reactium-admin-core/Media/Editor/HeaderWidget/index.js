import { __, useHandle } from 'reactium-core/sdk';
import React, { useEffect, useState } from 'react';
import { Button, Icon } from 'reactium-ui';
import useRouteParams from 'reactium_modules/@atomic-reactor/reactium-admin-core/Tools/useRouteParams';

const SaveButton = () => {
    const editor = useHandle('MediaEditor', {});

    const [busy, setBusy] = useState(false);

    const onStatus = () => {
        setBusy(editor.isBusy());
    };

    useEffect(() => {
        if (!editor) return;
        if (Object.keys(editor).length < 1) return;

        editor.addEventListener('STATUS', onStatus);
        return () => {
            editor.removeEventListener('STATUS', onStatus);
        };
    }, [Object.keys(editor)]);

    const render = () => {
        const label = busy ? __('Saving...') : __('Save File');
        const icon = busy ? 'Feather.UploadCloud' : 'Feather.Check';
        return (
            <Button
                appearance='pill'
                className='mr-xs-24'
                color={Button.ENUMS.COLOR.PRIMARY}
                disabled={busy}
                onClick={e => editor.submit(e)}
                size={Button.ENUMS.SIZE.XS}
                type={Button.ENUMS.TYPE.BUTTON}>
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
    const { path } = useRouteParams(['path']);
    const visible = String(path).startsWith('/admin/media/edit');
    return visible ? <SaveButton /> : null;
};
