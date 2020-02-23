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
    const [types, setTypes] = useState([]);
    const [updated, update] = useState();
    const MenuItem = useHookComponent('MenuItem');

    const isActive = (match = {}, location) =>
        String(op.get(location, 'pathname', '/'))
            .replace(/\\/gi, '')
            .toLowerCase()
            .startsWith('/admin/type');

    const getTypes = refresh => Reactium.ContentType.types(refresh);

    useEffect(() => {
        return Reactium.Cache.subscribe('content-types', async ({ op }) => {
            if (op === 'set') {
                const results = await getTypes(true);
                setTypes(results);
                update(Date.now());
            }
        });
    }, []);

    useAsyncEffect(async () => {
        const results = await getTypes(!!updated);
        setTypes(results);
        // console.log({ types });
        return () => {};
    }, [updated]);

    return (
        <MenuItem
            add='/admin/type/new'
            label={__('Content Types')}
            icon='Linear.Typewriter'
            isActive={isActive}
            onClick={e => Reactium.Routing.history.push('/admin/type/new')}>
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
