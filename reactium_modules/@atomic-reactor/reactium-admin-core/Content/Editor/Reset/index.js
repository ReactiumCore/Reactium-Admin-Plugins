import { useEffect } from 'react';
import Reactium from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Reset
 * -----------------------------------------------------------------------------
 */
export const Reset = () => {
    const redirect = Reactium.Cache.get('reset') || '/admin';

    useEffect(() => {
        Reactium.Routing.history.push(redirect);
        return () => {
            Reactium.Cache.del('reset');
        };
    }, []);

    return null;
};
