import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';
import { Dialog } from '@atomic-reactor/reactium-ui';

const MissingComparison = props => {
    const field = op.get(props, 'field', {});
    const value = op.get(props, 'value');
    const { fieldName: title } = field;

    return (
        <Dialog header={{ title }} collapsible={false}>
            <ul
                className='missing-fields p-xs-20'
                style={{ minHeight: '60px' }}>
                {value
                    ? value.map(key => (
                          <li key={key} className={'missing-field'}>
                              {key}
                          </li>
                      ))
                    : null}
            </ul>
        </Dialog>
    );
};

export default MissingComparison;
