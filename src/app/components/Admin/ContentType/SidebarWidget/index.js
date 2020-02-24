import uuid from 'uuid/v4';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useHandle,
    useHookComponent,
    Zone,
} from 'reactium-core/sdk';

export default () => {
    const watch = ['set', 'del'];
    const [types, setTypes] = useState([]);
    const [updated, update] = useState();
    const MenuItem = useHookComponent('MenuItem');

    const isActive = (match = {}, location) =>
        String(op.get(match, 'url', '/'))
            .replace(/\\/gi, '')
            .toLowerCase()
            .startsWith('/admin/type');

    const getTypes = refresh => Reactium.ContentType.types(refresh);

    useEffect(() => {
        return Reactium.Cache.subscribe('content-types', async ({ op }) => {
            if (watch.includes(op)) {
                const results = await getTypes(true);
                setTypes(results);
                update(Date.now());
            }
        });
    }, []);

    useAsyncEffect(async () => {
        const results = await getTypes();
        setTypes(results);
        return () => {};
        // return Reactium.Cache.subscribe('content-types', async ({ op }) => {
        //     console.log(op);
        //     if (watch.includes(op)) update(Date.now());
        // });
    }, [updated]);

    return (
        <MenuItem
            add='/admin/type/new'
            label={__('Content Types')}
            icon='Linear.Typewriter'
            isActive={isActive}
            route='/admin/types'>
            {types.map(({ uuid, type, meta }) => (
                <MenuItem
                    key={uuid}
                    label={`${meta.label}`}
                    route={`/admin/type/${uuid}`}
                />
            ))}
        </MenuItem>
    );
};
