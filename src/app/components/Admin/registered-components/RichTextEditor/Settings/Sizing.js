import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

const Sizing = () => {
    const { Icon } = useHookComponent('ReactiumUI');
    return (
        <>
            <div className='col-xs-5 form-group'>
                <input
                    type='text'
                    name='style.width'
                    className='text-center'
                    placeholder={__('width')}
                    title={__('width')}
                />
            </div>
            <div className='col-xs-2 flex middle center gray'>
                <Icon name='Feather.X' />
            </div>
            <div className='col-xs-5 form-group'>
                <input
                    type='text'
                    name='style.height'
                    className='text-center'
                    placeholder={__('height')}
                    title={__('height')}
                />
            </div>
        </>
    );
};

export { Sizing, Sizing as default };
