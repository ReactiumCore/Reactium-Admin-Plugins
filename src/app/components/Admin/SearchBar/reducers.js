import op from 'object-path';
import deps from 'dependencies';
import SearchBar from 'components/Admin/SearchBar';

const defaults = { ...SearchBar.defaultProps };

export default (state = {}, action) => {
    switch (action.type) {
        case deps().actionTypes.SEARCH_STATE:
            return { ...state, ...action.state };

        // Restore defaults
        case deps().actionTypes.UPDATE_ROUTE:
            return {
                ...state,
                focused: defaults.focused,
                icon: defaults.icon,
                placeholder: defaults.placeholder,
                value: defaults.value,
                visible: defaults.visible,
            };

        default:
            return state;
    }
};
