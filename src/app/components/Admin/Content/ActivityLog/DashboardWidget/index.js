import React from 'react';
import op from 'object-path';
import ActivityUpdates from '../ActivityUpdates';
import ENUMS from '../enums';

const DashboardWidget = props => {
    const id = op.get(props, 'id');
    const log = op.get(props, ['data', id], []);
    const cx = op.get(props, 'cx');

    return (
        <div className={cx('activity-updates')}>
            <ActivityUpdates
                log={log}
                className='dashboard'
                header={ENUMS.DASH_HEADER}
                scope={'general'}
                autoHeightMin={'600px'}
            />
        </div>
    );
};

export default DashboardWidget;
