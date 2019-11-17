import op from 'object-path';
import deps from 'dependencies';

export default (state = {}, action) => {
    switch (action.type) {
        case deps().actionTypes.SEARCH_UPDATE:
            return { ...state, ...action.state };

        case deps().actionTypes.UPDATE_ROUTE:
            return { ...state, value: null, visible: true };

        default:
            return state;
    }
};
