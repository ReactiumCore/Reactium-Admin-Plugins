import React from 'react';
import { __ } from 'reactium-core/sdk';
import { Button, FormError, Icon } from 'reactium-ui';

export const Editor = ({ editor }) => {
    const onClick = () => editor.Form.submit();

    return (
        <>
            <FormError name='submit' />
            <Button block onClick={onClick} size={Button.ENUMS.SIZE.MD}>
                <Icon name='Linear.CloudUpload' className='mr-xs-12' />
                {__('Save')}
            </Button>
        </>
    );
};
