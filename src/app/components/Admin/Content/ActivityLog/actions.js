import op from 'object-path';
import _ from 'underscore';
import deps from 'dependencies';
import domain from './domain';
import actionTypes from './actionTypes';
import Reactium from 'reactium-core/sdk';

export default {
    load: (event, type, handle) => async (dispatch, getState) => {
        const content = op.get(event, 'content');
        const contentId = op.get(content, 'objectId');
        const data = op.get(getState(), domain.name);

        // duplicate load or bad event
        if (!contentId || op.get(data, 'loading')) return;

        // content has changed
        if (contentId !== op.get(data, 'contentId')) {
            dispatch({
                type: actionTypes[domain.name].RESET,
                contentId,
            });
        }

        const { results } = await Reactium.Content.changelog(contentId);

        dispatch({
            type: op.get(deps(), 'actionTypes.DOMAIN_UPDATE'),
            domain: domain.name,
            update: {
                loading: false,
                log: _.indexBy(results, 'updatedAt'),
            },
        });

        const state = op.get(getState(), domain.name);
        await Reactium.Hook.run('activity-log-loaded', state);

        if (handle.isMounted())
            handle.dispatch('activity-log-loaded', { details: state });
        return state;
    },

    update: (logEntry, handle) => async dispatch => {
        const updatedAt = op.get(logEntry, 'updatedAt');

        dispatch({
            type: op.get(deps(), 'actionTypes.DOMAIN_UPDATE'),
            domain: domain.name,
            update: {
                log: {
                    [updatedAt]: logEntry,
                },
            },
        });

        if (handle.isMounted())
            handle.dispatch('activity-log-update', { details: logEntry });
    },
};
