import op from 'object-path';
import React, { useCallback } from 'react';
import ENUMS from 'components/Admin/Media/enums';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import ConfirmBox from 'components/Admin/registered-components/ConfirmBox';

const MediaDelete = ({ className, objectId, url, zone: zones, ...props }) => {
    const zone = zones[0];

    const tools = useHandle('AdminTools');

    // const ConfirmBox = useHookComponent('ConfirmBox');

    const Modal = op.get(tools, 'Modal');

    const deleteMedia = useCallback(() => {
        Reactium.Media.delete(objectId);
        Modal.dismiss();
    });

    const confirmDelete = useCallback(() => {
        Modal.show(
            <ConfirmBox
                message={
                    <>
                        {ENUMS.TEXT.DELETE_INFO[0]}
                        <div className='my-xs-8'>
                            <kbd>{url}</kbd>
                        </div>
                        {ENUMS.TEXT.DELETE_INFO[1]}
                    </>
                }
                onCancel={() => Modal.dismiss()}
                onConfirm={() => deleteMedia()}
                title={ENUMS.TEXT.CONFIRM_DELETE}
            />,
        );
    });

    const isEditor = String(zone).includes('admin-media-editor');

    return (
        <Button
            block
            className={className}
            color={Button.ENUMS.COLOR.DANGER}
            data-align='left'
            data-tooltip={!isEditor ? ENUMS.TEXT.DELETE : null}
            data-vertical-align='middle'
            onClick={() => confirmDelete()}
            size={Button.ENUMS.SIZE.SM}
            style={{ height: 40, maxHeight: 40 }}
            type={Button.ENUMS.TYPE.BUTTON}>
            <Icon name='Feather.X' />
            {isEditor && <span className='label'>{ENUMS.TEXT.DELETE}</span>}
        </Button>
    );
};

export { MediaDelete, MediaDelete as default };
