import _ from 'underscore';
import ENUMS from '../enums';
import { useEffect, useState } from 'react';
import Reactium, { __, useAsyncEffect, useStatus } from 'reactium-core/sdk';

const useData = (callback, hookID, delay, initialData) => {
    if (!_.isFunction(callback)) {
        throw new Error(__('useData() callback must be a [Function]'));
    }

    const [data, setData] = useState(initialData);
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.INIT);

    const fetch = async mounted => {
        if (!isStatus(ENUMS.STATUS.INIT)) return;

        setStatus(ENUMS.STATUS.PENDING);

        const results = await callback();

        if (mounted && !mounted()) return;

        if (!results) throw new Error(__('unable to fetch data'));

        if (hookID) {
            await Reactium.Hook.run(hookID, results);
        }

        setData(results);

        if (!mounted) return results;
    };

    const refresh = () => {
        setStatus(ENUMS.STATUS.INIT);
        return fetch();
    };

    useAsyncEffect(async mounted => {
        if (data) return;

        if (delay) {
            _.delay(fetch, delay, mounted);
        } else {
            fetch(mounted);
        }
    }, []);

    useEffect(() => {
        if (data) setStatus(ENUMS.STATUS.READY, true);
    }, [data]);

    return status === ENUMS.STATUS.READY ? [data, setData, refresh] : [];
};

export { useData, useData as default };
