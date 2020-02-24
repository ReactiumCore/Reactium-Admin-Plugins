import _ from 'underscore';
import op from 'object-path';
import pluralize from 'pluralize';
import React, { useEffect, useState } from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useHookComponent,
} from 'reactium-core/sdk';

export default () => {
    const MenuItem = useHookComponent('MenuItem');

    const watch = ['set', 'del'];
    const [types, setTypes] = useState([]);
    const [updated, update] = useState();

    const getTypes = refresh => Reactium.ContentType.types(refresh);

    useEffect(() => {
        return Reactium.Cache.subscribe('content-types', async ({ op }) => {
            if (watch.includes(op)) {
                const results = await getTypes(true);
                setTypes(results);
                update(Date.now());
            }
        });
    });

    useAsyncEffect(async () => {
        const results = await getTypes();
        setTypes(results);
        return () => {};
    }, [updated]);

    return types.map(item => {
        const { uuid, type, machineName, meta } = item;
        const icon = op.get(meta, 'icon', 'Linear.Document2');

        return (
            <MenuItem
                key={`content-${uuid}`}
                add={`/admin/content/${machineName}/new`}
                exact={false}
                label={__(pluralize(meta.label))}
                icon={icon}
                route={`/admin/content/${pluralize(type)}`}
            />
        );
    });
};
