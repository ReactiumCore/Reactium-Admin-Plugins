import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';

const noop = () => {};

const Sizing = ({ onChange = noop, value = {} }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    const _value = key => op.get(value, key, '');

    const _onChange = e => {
        let value = e.target.value;
        value = _.compact([value]).length < 1 ? null : value;
        value = value && _.isNumber(Number(value)) ? `${value}px` : value;
        value = _.isNull(value) ? '' : value;
        onChange({ target: { name: e.target.name, value } });
    };

    return (
        <>
            <div className='col-xs-5 form-group'>
                <input
                    type='text'
                    name='style.width'
                    title={__('width')}
                    onChange={_onChange}
                    className='text-center'
                    placeholder={__('width')}
                    defaultValue={_value('style.width')}
                />
            </div>
            <div className='col-xs-2 flex middle center gray'>
                <Icon name='Feather.X' />
            </div>
            <div className='col-xs-5 form-group'>
                <input
                    type='text'
                    name='style.height'
                    onChange={_onChange}
                    title={__('height')}
                    className='text-center'
                    placeholder={__('height')}
                    defaultValue={_value('style.height')}
                />
            </div>
        </>
    );
};

export { Sizing, Sizing as default };
