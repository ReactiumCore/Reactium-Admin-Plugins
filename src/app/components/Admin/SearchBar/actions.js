import deps from 'dependencies';

export default {
    setState: state => dispatch => {
        return dispatch({
            type: deps().actionTypes.SEARCH_STATE,
            state,
        });
    },
};
