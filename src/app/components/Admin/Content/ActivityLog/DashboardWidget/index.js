import React from 'react';
import op from 'object-path';
import ActivityUpdates from '../ActivityUpdates';
import ENUMS from '../enums';

const DashboardWidget = props => {
    const id = op.get(props, 'id');
    const log = op.get(props, ['data', id], []);
    const cx = op.get(props, 'cx');

    return (
        <div className='col-xs-12 col-md-4 col-xl-3 p-xs-24'>
            <ActivityUpdates
                className='col-xs-12'
                header={ENUMS.DASH_HEADER}
                log={log}
                scope='general'
            />
        </div>
    );
};

export default DashboardWidget;
