import deps from 'dependencies';

export default (state = {}, action) => {
    let newState;

    switch (action.type) {
        case deps().actionTypes.ADMIN_SIDEBAR_TOGGLE:
            newState = { ...state, expanded: action.expanded };
            return newState;

        default:
            return state;
    }
};
