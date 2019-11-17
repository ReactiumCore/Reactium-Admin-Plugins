import deps from 'dependencies';

export default {
    update: state => dispatch => {
        return dispatch({
            type: deps().actionTypes.SEARCH_UPDATE,
            state,
        });
    },
};
