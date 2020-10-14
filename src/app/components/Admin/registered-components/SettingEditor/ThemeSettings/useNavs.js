import { useState } from 'react';
import Reactium, { useAsyncEffect, useStatus } from 'reactium-core/sdk';

export default () => {
    const [data, setData] = useState();

    const [status, setStatus, isStatus] = useStatus('pending');

    const fetch = (page = 1) =>
        Reactium.Content.list({
            type: {
                machineName: 'navigation',
            },
            orderBy: 'title',
            direction: 'ascending',
            refresh: true,
            limit: 1000,
            page,
            status: 'PUBLISHED',
        });

    useAsyncEffect(async () => {
        if (!isStatus('pending')) return;
        setStatus('fetching');

        const temp = [];
        const addTemp = items => items.forEach(item => temp.push(item));

        let fetched = await fetch();
        let { page = 1, pages = 1, results = [] } = fetched;

        addTemp(results);

        while (page < pages) {
            page += 1;
            fetched = await fetch(page);
            let { results = [] } = fetched;
            if (results.length > 0) addTemp(results);
        }

        setStatus('ready');

        await Reactium.Hook.run('settings-nav-list', temp);

        setData(temp);
    }, [status]);

    return [data, setData];
};
