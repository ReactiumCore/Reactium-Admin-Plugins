import domain from './domain';
import deps from 'dependencies';

const formatFiles = state => {
    const { files = {} } = state;
    return { ...state, files: JSON.parse(JSON.stringify(files)) };
};

export default (state = {}, action) => {
    switch (action.type) {
        case deps().actionTypes.DOMAIN_UPDATE:
            if (action.domain === domain.name) {
                return formatFiles({
                    ...state,
                    ...action.update,
                    updated: Date.now(),
                });
            }

            return { ...state };

        default:
            return state;
    }
};
