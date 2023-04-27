import { useRouting } from 'reactium-core/sdk';
import _ from 'underscore';

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
