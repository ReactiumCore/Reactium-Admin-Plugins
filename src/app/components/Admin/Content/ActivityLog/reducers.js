import op from 'object-path';
import deps from 'dependencies';
import domain from './domain';
import actionTypes from './actionTypes';

export default (state = {}, action) => {
    switch (action.type) {
        case actionTypes[domain.name].RESET: {
            return {
                contentId: action.contentId,
                loading: true,
                log: {},
            };
        }

        case op.get(deps(), 'actionTypes.DOMAIN_UPDATE'): {
            // "Activity" or domain.name
            if (action.domain === domain.name) {
                return {
                    ...state,
                    ...action.update,
                    log: {
                        ...op.get(state, 'log', {}),
                        ...op.get(action.update, 'log', {}),
                    },
                };
            }
            return state;
        }

        default:
            return state;
    }
};
