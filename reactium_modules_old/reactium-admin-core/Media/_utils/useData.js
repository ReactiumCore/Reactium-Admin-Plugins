import _ from 'underscore';
import ENUMS from '../enums';
import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useStatus,
} from 'reactium-core/sdk';

const useData = (callback, hookID = 'useData', delay, initialData) => {
    if (!_.isFunction(callback)) {
        throw new Error(__('useData() callback must be a [Function]'));
    }

    const [data, setData] = useDerivedState(initialData);
    const [, setStatus, isStatus] = useStatus(ENUMS.STATUS.INIT);

    const fetch = async mounted => {
        setStatus(ENUMS.STATUS.PENDING, true);

        const results = await callback();

        if (mounted && !mounted()) return;

        if (!results) throw new Error(__('unable to fetch data'));

        if (hookID) Reactium.Hook.runSync(hookID, results);

        setData(results);

        if (!mounted) return results;
    };

    useAsyncEffect(async mounted => {
        if (!isStatus(ENUMS.STATUS.INIT)) return;

        if (delay) {
            _.delay(fetch, delay, mounted);
        } else {
            fetch(mounted);
        }
    }, []);

    return [data, setData, fetch];
};

export { useData, useData as default };
