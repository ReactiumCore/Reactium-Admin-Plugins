import op from 'object-path';
import pluralize from 'pluralize';
import Reactium from '@atomic-reactor/reactium-core/sdk';
import { useEffect, useState } from 'react';

export default (keys = ['type', 'slug', 'page'], deps = []) => {
    const timestamp = Date.now();
    const params = op.get(Reactium.Routing.currentRoute, 'params');
    const path = op.get(Reactium.Routing.currentRoute, 'match.route.path');

    const [value, setValue] = useState({
        type: null,
        slug: null,
        group: null,
        page: null,
        path,
        timestamp,
    });

    deps.push(params);
    deps.push(path);

    useEffect(() => {
        if (!params || !path) return;

        const paramClone = JSON.parse(JSON.stringify(params));

        const newValue = { path };

        if (keys.includes('group') && !keys.includes('type')) {
            keys.push('type');
        }

        keys.forEach((key) => {
            let val = op.get(paramClone, key);
            if (!val) return;

            if (key === 'type') {
                if (pluralize.isPlural(val)) {
                    op.set(newValue, 'group', val);
                    val = pluralize.singular(val);
                } else {
                    op.set(newValue, 'group', pluralize(val));
                }
            }

            return op.set(newValue, key, val);
        });

        setValue(newValue);
    }, deps);

    return value;
};
