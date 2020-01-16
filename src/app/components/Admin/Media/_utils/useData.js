import { useEffect, useState } from 'react';
import Reactium from 'reactium-core/sdk';

export default (callback, hookID) => {
    if (typeof callback !== 'function')
        throw new Error('useData() callback must be a `Function`');

    const ENUMS = {
        STATUS: {
            INIT: 'INIT',
            PENDING: 'PENDING',
            READY: 'READY',
        },
    };

    const [data, setData] = useState();
    const [status, setStatus] = useState(ENUMS.STATUS.INIT);

    const _fetch = async () => {
        if (status !== ENUMS.STATUS.INIT) return;
        setStatus(ENUMS.STATUS.PENDING);

        const results = await callback();

        if (!results) throw new Error('unable to fetch data');

        if (hookID) {
            await Reactium.Hook.run(hookID, results);
        }

        setData(results);
        setStatus(ENUMS.STATUS.READY);
    };

    useEffect(() => {
        _fetch();
    }, [data, status, callback]);

    return status === ENUMS.STATUS.READY ? [data, setData] : [];
};
