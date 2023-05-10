import React from 'react';
import { __ } from 'reactium-core/sdk';
import { Button, FormError, Icon } from 'reactium-ui';

export const Editor = ({ editor }) => {
    const onClick = () => editor.Form.submit();

    return (
        <div className={editor.cx('sidebar-element-publish-box')}>
            <FormError name='submit' />
            <Button block onClick={onClick} size={Button.ENUMS.SIZE.MD}>
                <Icon name='Linear.CloudUpload' size={30} />
                <span className='hide-xs show-sm ml-xs-12'>{__('Save')}</span>
            </Button>
        </div>
    );
};
