import React, { useEffect, useState } from 'react';
import op from 'object-path';
import ENUMS from 'components/Admin/Media/enums';
import Reactium, {
    __,
    useHandle,
    useWindow,
    useHookComponent,
} from 'reactium-core/sdk';
import { useSelect } from '@atomic-reactor/use-select';

export default () => {
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const path = useSelect(state => op.get(state, 'Router.match.path'));

    const isEditor = String(path).startsWith('/admin/media/edit');

    const Editor = useHandle('MediaEditor');

    const ID = isEditor ? op.get(Editor, 'state.value.objectId') : null;

    const type = isEditor ? op.get(Editor, 'state.value.type') : null;

    const visible = String(path).startsWith('/admin/media');

    const win = useWindow();

    const [location, setLocation] = useState(win.location.href);

    const [referrer, setReferrer] = useState();

    useEffect(() => {
        if (location !== win.location.href) {
            if (String(path).includes('/admin/media/:page')) {
                setReferrer(false);
            } else {
                if (String(location).includes('/admin/media')) {
                    setReferrer(false);
                } else {
                    setReferrer(true);
                }
            }

            setLocation(win.location.href);
        } else {
            if (String(path).includes('/admin/media/:page')) {
                setReferrer(false);
            }
        }
    });

    return (
        visible && (
            <>
                {referrer && (
                    <Button
                        className='px-0 mr-xs-12'
                        color='clear'
                        data-tooltip={__('Back')}
                        data-align='right'
                        data-vertical-align='middle'
                        size='sm'
                        onClick={() => Reactium.Routing.history.goBack()}
                        type='button'>
                        <Icon name='Linear.ArrowLeft' size={18} />
                    </Button>
                )}

                <ul className='ar-breadcrumbs'>
                    <li>
                        <Button
                            className='px-0'
                            color='clear'
                            size='sm'
                            to='/admin/media/1'
                            type='link'>
                            <Icon name='Linear.Picture' className='mr-xs-12' />
                            {ENUMS.TEXT.MEDIA}
                        </Button>
                    </li>
                    {type && <li className='uppercase'>{type}</li>}
                    {ID && <li>{ID}</li>}
                </ul>
            </>
        )
    );
};
