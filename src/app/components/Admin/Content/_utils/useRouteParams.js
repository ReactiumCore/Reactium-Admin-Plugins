import _ from 'underscore';
import op from 'object-path';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import { useSelect } from 'reactium-core/sdk';

export default (keys = ['type', 'slug']) => {
    const path = useSelect(state => op.get(state, 'Router.match.path'));
    const params = useSelect(state => op.get(state, 'Router.params'));
    const [value, setValue] = useState({ type: null, slug: null, group: null });

    useEffect(() => {
        if (!params || !path) return;

        const newValue = { path };

        keys.forEach(key => {
            let val = op.get(params, key);
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

        if (_.isEqual(value, newValue)) return;

        setValue(newValue);
    }, [params, path]);

    return value;
};
