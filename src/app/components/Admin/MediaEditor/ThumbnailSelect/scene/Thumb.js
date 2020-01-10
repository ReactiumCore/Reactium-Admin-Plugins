import React from 'react';
import op from 'object-path';
import copy from 'copy-to-clipboard';
import ENUMS from 'components/Admin/Media/enums';
import Reactium, { __, useHandle } from 'reactium-core/sdk';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';

export default ({
    id,
    label,
    navTo,
    options,
    setRef,
    title,
    thumbnail,
    ...handle
}) => {
    const tools = useHandle('AdminTools');

    const Toast = op.get(tools, 'Toast');

    const onCopy = () => {
        copy(Reactium.Media.url(thumbnail));

        Toast.show({
            icon: 'Linear.ClipboardDown',
            message: ENUMS.TEXT.COPIED_TO_CLIPBOARD,
            type: Toast.TYPE.INFO,
        });
    };

    const render = () => {
        return (
            <div id={id} className='admin-thumbnail-select p-0'>
                <div
                    className='admin-image-crop'
                    ref={elm => setRef(elm, 'canvas.container')}>
                    {thumbnail ? (
                        <a
                            href={Reactium.Media.url(thumbnail)}
                            target='_blank'
                            ref={elm => setRef(elm, 'canvas.image')}
                            className='canvas'
                        />
                    ) : (
                        <div
                            ref={elm => setRef(elm, 'canvas.image')}
                            className='canvas'
                        />
                    )}
                    <Button
                        appearance='pill'
                        color='default'
                        className='remove'
                        onClick={() => navTo('pick', 'right')}
                        size='sm'>
                        {__('Select')}
                    </Button>
                    <div className='actions'>
                        <Button
                            appearance='circle'
                            color='danger'
                            data-tooltip={`${__('Delete')} ${label}`}
                            data-align='left'
                            data-vertical-align='middle'
                            onClick={() => navTo('delete', 'left')}>
                            <Icon name='Feather.X' />
                        </Button>
                        {thumbnail && (
                            <Button
                                appearance='circle'
                                color='default'
                                data-tooltip={ENUMS.TEXT.COPY_TO_CLIPBOARD}
                                data-align='left'
                                data-vertical-align='middle'
                                onClick={onCopy}>
                                <Icon name='Linear.ClipboardDown' />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return render();
};

/*
const width = op.get(
    options,
    'width',
    op.get(options, 'sizes.default.width', 200),
);
const height = op.get(
    options,
    'height',
    op.get(options, 'sizes.default.height', 200),
);
*/
