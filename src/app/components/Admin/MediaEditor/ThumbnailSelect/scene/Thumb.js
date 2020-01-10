import React from 'react';
import op from 'object-path';
import { __ } from 'reactium-core/sdk';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';

export default ({ id, label, navTo, options, setRef, title, ...handle }) => {
    const render = () => {
        return (
            <div id={id} className='admin-thumbnail-select p-0'>
                <div
                    className='admin-image-crop'
                    ref={elm => setRef(elm, 'canvas.container')}>
                    <div
                        ref={elm => setRef(elm, 'canvas.image')}
                        className='canvas'
                    />
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
