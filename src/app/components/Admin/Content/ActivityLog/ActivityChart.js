import React from 'react';
import cn from 'classnames';
import Reactium from 'reactium-core/sdk';

const ActivityChart = props => {
    let { className, log = [], namespace } = props;

    const cx = Reactium.Utils.cxFactory(namespace);

    return <div className={cn(cx(), className)}>ActivityChart</div>;
};

ActivityChart.defaultProps = {
    className: 'col-xs-12 col-md-8 col-lg-10',
    log: [],
    namespace: 'activity-log-chart',
};

export default ActivityChart;
