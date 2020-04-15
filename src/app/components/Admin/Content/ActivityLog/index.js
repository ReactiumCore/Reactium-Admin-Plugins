import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import domain from './domain';
import ActivityChart from './ActivityChart';
import ActivityUpdates from './ActivityUpdates';
import Reactium, { __, useReduxState } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Activity
 * -----------------------------------------------------------------------------
 */
const Activity = props => {
    const [activity] = useReduxState(domain.name);
    const log = Object.values(op.get(activity, 'log', {}));

    // console.log(log);

    return (
        <div className='activity-log'>
            <ActivityChart log={log} />
            <ActivityUpdates log={log} />
        </div>
    );
};

export default Activity;
