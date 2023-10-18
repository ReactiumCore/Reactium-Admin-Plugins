import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import { useHookComponent } from '@atomic-reactor/reactium-core/sdk';

export const UploaderPreviewAction = ({ file, uploader, zone }) => {
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return zone === 'media-editor-upload-item-action' ? (
        <Button
            disabled={uploader.uploading(file.ID)}
            type={Button.ENUMS.TYPE.BUTTON}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.target.blur();
                uploader.removeUpload(item);
            }}
            color={
                !uploader.uploading(file.ID)
                    ? Button.ENUMS.COLOR.DANGER
                    : Button.ENUMS.COLOR.CLEAR
            }
        >
            <Icon
                className={cn({ spin: uploader.uploading(file.ID) })}
                name={
                    !uploader.uploading(file.ID) ? 'Feather.X' : 'Linear.Sync'
                }
            />
        </Button>
    ) : (
        <Button
            type={Button.ENUMS.TYPE.BUTTON}
            color={Button.ENUMS.COLOR.DANGER}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.target.blur();
                uploader.removeFile(op.get(file, 'metadata.ID'));
            }}
        >
            <Icon name='Feather.X' />
        </Button>
    );
};

export default UploaderPreviewAction;
