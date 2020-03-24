import op from 'object-path';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHandle } from 'reactium-core/sdk';
import React, { useCallback, useEffect, useState } from 'react';
import useRouteParams from 'components/Admin/Tools/useRouteParams';

const SaveButton = ({ type }) => {
    const editor = useHandle('MediaEditor');

    const [busy, setBusy] = useState(false);

    const onStatus = e => {
        setBusy(editor.isBusy());
    };

    useEffect(() => {
        editor.addEventListener('STATUS', onStatus);
        return () => {
            editor.removeEventListener('STATUS', onStatus);
        };
    }, [editor]);

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

export default props => {
    const { path } = useRouteParams(['path']);
    const visible = String(path).startsWith('/admin/media/edit');
    return visible ? <SaveButton /> : null;
};
