import op from 'object-path';
import React, { useCallback } from 'react';
import ENUMS from 'components/Admin/Media/enums';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useHandle, useHookComponent } from 'reactium-core/sdk';
import ConfirmBox from 'components/Admin/registered-components/ConfirmBox';

const MediaDelete = props => {
    const tools = useHandle('AdminTools');

    // const ConfirmBox = useHookComponent('ConfirmBox');

    const Modal = op.get(tools, 'Modal');

    const deleteMedia = useCallback(() => {
        const { objectId } = props;
        Reactium.Media.delete(objectId);
        Modal.dismiss();
    });

    const confirmDelete = useCallback(() => {
        const { url } = props;

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

    return (
        <Button
            color={Button.ENUMS.COLOR.DANGER}
            data-align='left'
            data-tooltip={ENUMS.TEXT.DELETE}
            data-vertical-align='middle'
            onClick={() => confirmDelete()}
            type={Button.ENUMS.TYPE.BUTTON}>
            <Icon name='Feather.X' />
        </Button>
    );
};

export { MediaDelete, MediaDelete as default };
