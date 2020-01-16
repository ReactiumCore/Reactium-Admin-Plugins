import React from 'react';
import op from 'object-path';
import ENUMS from 'components/Admin/Media/enums';
import { useHandle, useSelect } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

export default () => {
    const path = useSelect(state => op.get(state, 'Router.match.path'));

    const isEditor = String(path).startsWith('/admin/media/edit');

    const Editor = useHandle('MediaEditor');

    const ID = isEditor ? op.get(Editor, 'state.value.objectId') : null;

    const type = isEditor ? op.get(Editor, 'state.value.type') : null;

    const visible = String(path).startsWith('/admin/media');

    return (
        visible && (
            <ul className='ar-breadcrumbs'>
                <li>
                    <Button
                        appearance='pill'
                        className='px-0'
                        color='clear'
                        size='sm'
                        to='/admin/media/1'
                        type='link'>
                        <Icon name='Linear.Pictures' className='mr-xs-12' />
                        {ENUMS.TEXT.MEDIA}
                    </Button>
                </li>
                {type && <li className='uppercase'>{type}</li>}
                {ID && <li>{ID}</li>}
            </ul>
        )
    );
};
