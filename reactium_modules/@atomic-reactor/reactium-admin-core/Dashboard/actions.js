import Reactium from 'reactium-core/sdk';
import domain from './domain';
import op from 'object-path';
import deps from 'dependencies';

export default {
    load: () => async (dispatch, getState) => {
        const getCurrent = () => op.get(getState(), [domain.name], {});

        const setState = (id, update = {}) =>
            dispatch({
                type: deps().actionTypes.DOMAIN_UPDATE,
                domain: domain.name,
                update: {
                    [id]: {
                        ...op.get(getCurrent(), id, {}),
                        ...update,
                    },
                },
            });

        const getStateById = id => op.get(getCurrent(), id, {});

        await Reactium.Hook.run('dashboard-data-load', getStateById, setState);

        return getCurrent();
    },
};
