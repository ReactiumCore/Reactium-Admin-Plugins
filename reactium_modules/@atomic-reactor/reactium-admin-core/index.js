import Reactium, { useRouting } from 'reactium-core/sdk';
import _ from 'underscore';
import { useEffect, useState } from 'react';

export const useDoesMatchPath = (
    pattern,
    where = ['active', 'match', 'match', 'path'],
) => {
    const routing = useRouting();
    const path = [..._.compact(_.flatten([where]))];

    const what = routing.get(path);

    if (_.isRegExp(pattern)) {
        return pattern.test(what);
    } else if (_.isString(pattern)) {
        return new RegExp(pattern).test(what);
    } else if (_.isFunction(pattern)) {
        return pattern(what);
    }
};

export const useRouteParams = () => {
    const routing = useRouting();
    return routing.get('active.match.match.params');
};

export const useUpdater = () => {
    const [, updater] = useState(new Date());
    return () => updater(new Date());
};

export const useAttachSyncState = target => {
    const update = useUpdater();
    useEffect(() => target.addEventListener('change', update));
    return target;
};

export const useAttachHandle = name => {
    return useAttachSyncState(Reactium.Handle.get(`${name}.current`));
};
