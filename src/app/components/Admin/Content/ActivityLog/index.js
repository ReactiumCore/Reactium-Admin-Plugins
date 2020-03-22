import React from 'react';
import Reactium, { useReduxState, __ } from 'reactium-core/sdk';
import _ from 'underscore';
import op from 'object-path';
import domain from './domain';
import ActivityUpdates from './ActivityUpdates';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Activity
 * -----------------------------------------------------------------------------
 */
const Activity = props => {
    const [activity] = useReduxState(domain.name);
    const log = Object.values(op.get(activity, 'log', {}));

    return (
        <div className='activity-log'>
            <div className='activity-log-chart col-xs-12 col-md-8 col-lg-10'></div>
            <ActivityUpdates log={log} />
        </div>
    );
};

export default Activity;
