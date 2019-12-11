import op from 'object-path';
import domain from './domain';
import deps from 'dependencies';

export default (state = {}, action) => {
    switch (action.type) {
        case deps().actionTypes.DOMAIN_UPDATE:
            if (action.domain === domain.name) {
                return {
                    ...state,
                    ...action.update,
                    updated: Date.now(),
                };
            }

            return { ...state };

        case deps().actionTypes.UPDATE_ROUTE:
            if (
                !String(op.get(action, 'match.path', '/')).startsWith(
                    '/admin/media',
                )
            ) {
                delete state.fetched;
                delete state.pagination;
                delete state.search;
            }

            const page = Number(op.get(action.params, 'page', 1));

            return { ...state, page };

        default:
            return state;
    }
};
