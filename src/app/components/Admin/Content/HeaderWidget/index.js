import op from 'object-path';
import React, { useEffect, useState } from 'react';
import ENUMS from 'components/Admin/Content/enums';
import useRouteParams from '../_utils/useRouteParams';
import { useHandle } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

export default () => {
    const { path, slug, type } = useRouteParams(['path', 'slug', 'type']);
    const visible = String(path).startsWith('/admin/content');

    const Editor = useHandle('AdminContentEditor');

    const [status, setStatus] = useState();

    useEffect(() => {
        if (!visible || !Editor) return;

        console.log(Editor);
        setStatus('READY');

        //setStatus(Editor.EventForm.ENUMS.STATUS.READY);
    }, [Editor, status, visible, op.get(Editor, 'EventForm')]);

    useEffect(() => {
        if (!visible || !Editor) return;
        console.log(status);
    }, [status]);

    if (!visible) return null;
    return !slug ? (
        <Button
            appearance='pill'
            className='mr-xs-24'
            color='primary'
            outline
            size='xs'
            to={`/admin/content/${type}/new`}
            type='link'>
            <Icon name='Feather.Plus' size={18} />
            <span className='hide-xs show-md ml-xs-12'>
                {' '}
                {ENUMS.TEXT.NEW} {type}
            </span>
        </Button>
    ) : status ? (
        <Button
            appearance='pill'
            className='mr-xs-24'
            color='primary'
            onClick={() => Editor.submit()}
            size='xs'
            type='button'>
            <Icon name='Feather.Check' size={18} />
            <span className='hide-xs show-md ml-xs-12'>
                {' '}
                {ENUMS.TEXT.SAVE} {type}
            </span>
        </Button>
    ) : null;
};
