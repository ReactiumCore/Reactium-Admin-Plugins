import op from 'object-path';
import copy from 'copy-to-clipboard';
import React, { useRef } from 'react';
import ENUMS from 'reactium_modules/@atomic-reactor/reactium-admin-core/Media/enums';
import Reactium, { __, useHandle } from 'reactium-core/sdk';
import { Button, Dialog, Icon } from '@atomic-reactor/reactium-ui';

const ImageCrop = props => {
    const { editor, field = 'thumbnail', label, options, tooltip } = props;

    const imageRef = useRef();

    const tools = useHandle('AdminTools');

    const Toast = op.get(tools, 'Toast');

    const { setState, state = {} } = editor;

    const onCopyClick = () => {
        const image = op.get(state.value, field);
        const url = op.get(
            state.value,
            'redirect.url',
            Reactium.Media.url(image),
        );

        if (url) {
            copy(url);
            Toast.show({
                icon: 'Linear.ClipboardCheck',
                message: ENUMS.TEXT.COPIED_TO_CLIPBOARD,
                type: Toast.TYPE.INFO,
            });
        }
    };

    const onRefreshClick = () => {
        const file = op.get(state.value, 'file');
        const objectId = op.get(state.value, 'objectId');
        const url = op.get(
            state.value,
            'redirect.url',
            Reactium.Media.url(file),
        );

        if (url && objectId) {
            return Reactium.Media.crop({ field, objectId, options, url }).then(
                results => {
                    const value = { ...state.value };
                    op.set(value, field, results);
                    setState({ value });

                    Toast.show({
                        icon: 'Feather.Image',
                        message: __('Image updated!'),
                        type: Toast.TYPE.INFO,
                    });
                },
            );
        }
    };

    const render = () => {
        const image = op.get(state.value, field);
        const url = image
            ? Reactium.Media.url(image)
            : op.get(state.value, 'redirect.url');

        return !url ? null : (
            <Dialog
                header={{ title: label }}
                pref={`admin.dialog.media.editor.${field}`}>
                <div className='admin-image-crop'>
                    {url && <img src={url} ref={imageRef} />}
                    {!url && (
                        <Icon
                            name='Feather.Image'
                            size={56}
                            className='placeholder'
                        />
                    )}
                    <Button
                        appearance='pill'
                        className='refresh'
                        color='default'
                        onClick={() => onRefreshClick()}
                        data-tooltip={tooltip.generate}
                        size='sm'
                        type='button'>
                        {__('Generate')}
                    </Button>
                    <div className='actions'>
                        <Button
                            color='default'
                            type='button'
                            appearance='circle'
                            onClick={() => onCopyClick()}
                            data-vertical-align='middle'
                            data-align='left'
                            data-tooltip={tooltip.copy}>
                            <Icon name='Linear.ClipboardDown' size={20} />
                        </Button>
                    </div>
                </div>
            </Dialog>
        );
    };

    return render();
};

export { ImageCrop, ImageCrop as default };
