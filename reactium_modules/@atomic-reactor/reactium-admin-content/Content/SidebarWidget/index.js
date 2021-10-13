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

    const [types, setTypes] = useState([]);
    const [updated, update] = useState();

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
        true,
    );

    return types.map(item => {
        const { uuid, type, machineName, meta } = item;
        const icon = op.get(meta, 'icon', 'Linear.Document2');

        return (
            <MenuItem
                key={`content-${uuid}`}
                add={`/admin/content/${machineName}/new`}
                exact={false}
                label={pluralize(meta.label)}
                icon={icon}
                route={`/admin/content/${pluralize(type)}/page/1`}
            />
        );
    });
};
