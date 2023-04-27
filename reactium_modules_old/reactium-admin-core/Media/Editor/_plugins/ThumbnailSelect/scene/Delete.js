import React from 'react';
import op from 'object-path';
import { __ } from 'reactium-core/sdk';
import { Button, Icon } from 'reactium-ui';

export default ({ deleteThumbnail, id, navTo, state, ...handle }) => {
    const render = () => {
        return (
            <div id={id} className='admin-thumbnail-select'>
                <div className='delete-scene'>
                    <p>{__('Are you sure?')}</p>
                    <div className='flex'>
                        <Button
                            className='mx-xs-12'
                            color='danger'
                            size='sm'
                            style={{ width: 80 }}
                            onClick={() => navTo('thumb', 'right')}>
                            {__('No')}
                        </Button>
                        <Button
                            className='mx-xs-12'
                            color='primary'
                            size='sm'
                            style={{ width: 80 }}
                            onClick={() => deleteThumbnail()}>
                            {__('Yes')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return render();
};
