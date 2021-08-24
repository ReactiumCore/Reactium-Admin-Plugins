import op from 'object-path';
import copy from 'copy-to-clipboard';
import React, { useCallback } from 'react';
import ENUMS from 'reactium_modules/@atomic-reactor/reactium-admin-core/Media/enums';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHandle } from 'reactium-core/sdk';

const MediaCopy = props => {
    const tools = useHandle('AdminTools');

    const Toast = op.get(tools, 'Toast');

    const onClick = () => {
        const { edgeURL, filename } = props;
        const message = String(__('Copied %filename to clipboard')).replace(
            /\%filename/gi,
            filename,
        );

        copy(edgeURL);

        Toast.show({
            message,
            type: Toast.TYPE.INFO,
            icon: 'Linear.ClipboardDown',
        });
    };

    return (
        <Button
            color={Button.ENUMS.COLOR.CLEAR}
            data-align='left'
            data-tooltip={ENUMS.TEXT.COPY_TO_CLIPBOARD}
            data-vertical-align='middle'
            onClick={() => onClick()}
            type={Button.ENUMS.TYPE.BUTTON}>
            <Icon name='Linear.ClipboardDown' size={24} />
        </Button>
    );
};

export { MediaCopy, MediaCopy as default };
