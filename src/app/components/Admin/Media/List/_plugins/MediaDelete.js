import op from 'object-path';
import React, { useCallback } from 'react';
import ENUMS from 'components/Admin/Media/enums';
import Reactium, { useHandle, useHookComponent } from 'reactium-core/sdk';

const MediaDelete = ({ className, handle, objectId, url, zone: zones }) => {
    const zone = zones[0];

    const tools = useHandle('AdminTools');

    const ConfirmBox = useHookComponent('ConfirmBox');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const Modal = op.get(tools, 'Modal');

    const deleteMedia = async () => {
        Modal.dismiss();

        const data = op.get(handle.state, 'data', {});
        op.del(data, objectId);

        // optimistic delete
        handle.setState({ data });

        // do delete
        Reactium.Media.delete(objectId);
    };

    const confirmDelete = useCallback(() => {
        Modal.show(
            <ConfirmBox
                message={
                    <>
                        {ENUMS.TEXT.DELETE_INFO[0]}
                        <div className='my-xs-8 break-word blue'>{url}</div>
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
