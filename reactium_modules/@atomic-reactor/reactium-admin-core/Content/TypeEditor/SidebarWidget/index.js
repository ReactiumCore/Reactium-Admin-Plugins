import uuid from 'uuid/v4';
import _ from 'underscore';
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
        String(op.get(match, 'url', '/'))
            .replace(/\\/gi, '')
            .toLowerCase()
            .startsWith('/admin/type');

    const getTypes = () => Reactium.ContentType.types();

    useAsyncEffect(
        async mounted => {
            const results = await getTypes();
            if (mounted()) setTypes(results);
            return Reactium.Cache.subscribe('content-types', async ({ op }) => {
                if (['set', 'del'].includes(op) && mounted() === true) {
                    update(Date.now());
                }
            });
        },
        [updated],
    );

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
