import React from 'react';
import op from 'object-path';
import { useHookComponent } from '@atomic-reactor/reactium-core/sdk';

export default (props) => {
    const field = op.get(props, 'field', {});
    const value = op.get(props, 'value');
    const { fieldName: title } = field;
    const { Dialog } = useHookComponent('ReactiumUI');

    return (
        <Dialog header={{ title }} collapsible={false}>
            <div className='p-xs-20' style={{ minHeight: '60px' }}>
                {value ? value : null}
            </div>
        </Dialog>
    );
};
