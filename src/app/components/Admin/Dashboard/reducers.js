import deps from 'dependencies';

export default (state = {}, action) => {
    let newState;

    switch (action.type) {
        case deps().actionTypes.DASHBOARD_LOAD:
            newState = { ...state, ...action.data };
            return newState;

        default:
            return state;
    }
};
