import React from 'react';
import op from 'object-path';
import { __ } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

export default ({
    refs,
    id,
    title,
    navTo,
    showPicker,
    state,
    thumbnail,
    ...handle
}) => {
    const render = () => {
        return (
            <div id={id} className='admin-thumbnail-select'>
                <div className='empty'>
                    <div className='my-xs-8'>
                        <Button
                            appearance='pill'
                            color='tertiary'
                            onClick={() => showPicker()}
                            outline
                            style={{ width: 172 }}>
                            {__('Select')} {title}
                        </Button>
                    </div>
                    <div className='my-xs-8'>
                        <Button
                            appearance='pill'
                            color='tertiary'
                            onClick={() => refs.input.file.click()}
                            outline
                            style={{ width: 172 }}>
                            {__('Upload')} {title}
                        </Button>
                    </div>
                    {thumbnail && (
                        <div className='my-xs-8'>
                            <Button
                                appearance='pill'
                                color='danger'
                                onClick={() => navTo('thumb')}
                                style={{ width: 172 }}>
                                {__('Cancel')}
                            </Button>
                        </div>
                    )}
                    <div className='actions'>
                        <Button
                            className='settings'
                            color='clear'
                            onClick={() => navTo('config')}
                            style={{ width: 40, height: 40 }}>
                            <Icon name='Linear.Cog' />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return render();
};
