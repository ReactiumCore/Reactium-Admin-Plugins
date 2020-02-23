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

    const getTypes = refresh => Reactium.ContentType.types(refresh);

    useEffect(() => {
        return Reactium.Cache.subscribe('content-types', async ({ op }) => {
            if (op === 'set') {
                let results = await getTypes(true);
                results = _.sortBy(results, 'label');

                setTypes(results);
                update(Date.now());
            }
        });
    }, []);

    useAsyncEffect(async () => {
        const results = await getTypes(!!updated);
        setTypes(results);
        return () => {};
    }, [updated]);

    return (
        <>
            {types.map(item => {
                const { uuid, type, meta } = item;

                const icon = op.get(meta, 'icon', 'Linear.Document2');

                const isActive = (match = {}, location) => {
                    return String(op.get(location, 'pathname', '/'))
                        .replace(/\\/gi, '')
                        .startsWith(`/admin/content/${type}`);
                };

                const onClick = () =>
                    Reactium.Routing.history.push(
                        `/admin/content/${pluralize(type)}`,
                    );

                return (
                    <MenuItem
                        key={`content-${uuid}`}
                        add={`/admin/content/${type}/new`}
                        label={__(pluralize(meta.label))}
                        icon={icon}
                        isActive={isActive}
                        onClick={onClick}
                    />
                );
            })}
        </>
    );
};
