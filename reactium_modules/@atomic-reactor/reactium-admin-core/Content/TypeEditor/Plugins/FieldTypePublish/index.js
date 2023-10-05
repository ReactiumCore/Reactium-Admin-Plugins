import React, { useMemo } from 'react';
import { __ } from '@atomic-reactor/reactium-core/sdk';
import { Button, FormError, Icon } from 'reactium-ui';

export const Editor = ({ editor }) => {
    const onClick = () => editor.submit();

    const disabled = useMemo(
        () => editor.get('disabled'),
        [editor.get('disabled')],
    );

    return (
        <div className={editor.cx('sidebar-element-publish-box')}>
            <FormError name='submit' />
            <Button
                block
                disabled={disabled}
                onClick={onClick}
                size={Button.ENUMS.SIZE.MD}
            >
                <Icon name='Linear.CloudUpload' size={30} />
                <span className='hide-xs show-sm ml-xs-12'>{__('Save')}</span>
            </Button>
        </div>
    );
};
