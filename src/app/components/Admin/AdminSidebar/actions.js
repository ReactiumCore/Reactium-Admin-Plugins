import deps from 'dependencies';

export default {
    status: expanded => dispatch =>
        dispatch({
            type: deps().actionTypes.ADMIN_SIDEBAR_TOGGLE,
            expanded,
        }),
};
