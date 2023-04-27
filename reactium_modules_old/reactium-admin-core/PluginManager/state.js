import op from 'object-path';

/**
 * PluginManager Initial State
 */
export default {
    plugins:
        typeof window !== 'undefined'
            ? op.get(window, 'plugins', [])
            : op.get(global, 'plugins', []),
};
