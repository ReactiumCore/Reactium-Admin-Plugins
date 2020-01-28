import _ from 'underscore';
import op from 'object-path';
import { useState } from 'react';
import Reactium from 'reactium-core/sdk';

export default (editor, type, initialItems) => {
    const nodes = items => {
        items = _.isObject(items) ? Object.values(items) : items;
        items = Array.from(items);

        let filter = op.get(editor.filter, type, undefined);

        if (typeof filter !== 'function') {
            const excludes = op.get(editor.exclude, type, []);
            const includes = op.get(editor.include, type, []);

            filter = ({ id }) => {
                if (!Array.isArray(excludes) && !Array.isArray(includes))
                    return true;

                if (excludes.length < 1 && includes.length < 1) return true;

                const isExcluded =
                    excludes.length > 0 ? excludes.includes(id) : false;
                if (isExcluded) return false;

                const isIncluded =
                    includes.length > 0 ? includes.includes(id) : true;
                return isIncluded;
            };
        }

        return items.filter(filter);
    };

    return useState(nodes(initialItems));
};
