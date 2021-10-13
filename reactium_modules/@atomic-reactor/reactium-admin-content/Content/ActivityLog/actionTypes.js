import domain from './domain';

export default {
    [domain.name]: {
        RESET: Symbol(`RESET-${domain.name}`),
    },
};
