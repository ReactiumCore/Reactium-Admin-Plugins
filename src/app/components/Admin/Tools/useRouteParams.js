import _ from 'underscore';
import op from 'object-path';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import { useDerivedState, useSelect } from 'reactium-core/sdk';

export default (keys = ['type', 'slug', 'page'], deps = []) => {
    const timestamp = Date.now();
    const path = useSelect(state => op.get(state, 'Router.match.path'));
    const params = useSelect(state => op.get(state, 'Router.params'));
    const [value, setValue] = useState({
        type: null,
        slug: null,
        group: null,
        page: null,
        path,
        timestamp,
    });

    deps.push(params, path);

    useEffect(() => {
        if (!params || !path) return;

        const paramClone = JSON.parse(JSON.stringify(params));

        const newValue = { path };

        if (keys.includes('group') && !keys.includes('type')) {
            keys.push('type');
        }

        keys.forEach(key => {
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
