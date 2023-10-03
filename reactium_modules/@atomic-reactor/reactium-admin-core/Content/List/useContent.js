import _ from 'underscore';
import op from 'object-path';
import { useState } from 'react';
import Reactium, { useAsyncEffect } from '@atomic-reactor/reactium-core/sdk';

export const useContent = (type, defaultValue = []) => {
    const [page, setPage] = useState(1);
    const [updated, update] = useState();
    const [content, setContent] = useState(defaultValue);

    const fetch = (params = {}) => Reactium.Content.fetch(params);

    const refresh = () => fetch({ page, type, refresh: true });

    useAsyncEffect(
        async (mounted) =>
            Reactium.Cache.subscribe(
                `content.${type}`,
                async ({ op: oper, value }) => {
                    if (['set', 'del'].includes(oper)) {
                        const changed = op.get(value, type);
                        if (mounted()) setContent(changed);
                        update(Date.now());
                    }
                },
            ),
        [type, updated],
    );

    useAsyncEffect(
        async (mounted) => {
            const results = await fetch({ page, type });
            const pages = op.get(
                Reactium.Content.pagination,
                [type, 'pages'],
                1,
            );

            if (mounted()) setContent(results);
            if (page < pages) setPage(page + 1);
        },
        [page, type],
    );

    return [content, refresh];
};
