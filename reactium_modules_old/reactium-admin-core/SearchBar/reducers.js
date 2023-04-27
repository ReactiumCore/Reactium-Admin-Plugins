import domain from './domain';
import deps from 'dependencies';
import SearchBar from 'reactium_modules/@atomic-reactor/reactium-admin-core/SearchBar';

const defaults = { ...SearchBar.defaultProps };

export default (state = {}, action) => {
    switch (action.type) {
        case deps().actionTypes.DOMAIN_UPDATE:
            if (action.domain === domain.name) {
                return { ...state, ...action.update };
            }

            return { ...state };

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
