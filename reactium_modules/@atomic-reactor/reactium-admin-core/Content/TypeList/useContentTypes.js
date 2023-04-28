import { useState } from 'react';
import Reactium, { useAsyncEffect } from 'reactium-core/sdk';

export const useContentTypes = () => {
    const [updated, update] = useState();
    const [types, setTypes] = useState([]);

    const fetch = (params = {}) => Reactium.ContentType.types(params);

    const refresh = () => fetch({ refresh: true });

    useAsyncEffect(
        async mounted => {
            const results = await fetch();

            if (mounted()) setTypes(results);

            return Reactium.Cache.subscribe('content-types', async ({ op }) => {
                if (['set', 'del'].includes(op) && mounted() === true) {
                    update(Date.now());
                }
            });
        },
        [updated],
    );

    return [types, refresh];
};
