import React, { useRef, useState, useEffect } from 'react';
import op from 'object-path';
import Reactium, { useHandle, useSelect, __ } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import uuid from 'uuid/v4';

export default () => {
    const id = useSelect(state => op.get(state, 'Router.params.id'));
    const path = useSelect(state => op.get(state, 'Router.match.path'));
    const visible = String(path).startsWith('/admin/type/');
    const typesRef = useRef([]);
    const [, update] = useState(uuid());

    const getTypes = async (refresh = false) => {
        const types = await Reactium.ContentType.types(refresh);
        typesRef.current = types;
        update(uuid());
    };

    useEffect(() => {
        getTypes();
        return Reactium.Cache.subscribe('content-types', async ({ op }) => {
            if (op === 'del') getTypes(true);
        });
    }, [id, path]);

    const { type } = typesRef.current.find(type => type.uuid === id) || {};

    return (
        visible && (
            <ul className='ar-breadcrumbs'>
                <li>
                    <Button
                        appearance='pill'
                        className='px-0'
                        color='clear'
                        size='sm'
                        to='/admin/type/new'
                        type='link'>
                        <Icon name='Linear.Typewriter' className='mr-xs-12' />
                        {__('Content Type')}
                    </Button>
                </li>
                <li className='uppercase'>{type || __('New')}</li>
                {type && <li>{id}</li>}
            </ul>
        )
    );
};
