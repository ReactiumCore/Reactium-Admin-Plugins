import uuid from 'uuid/v4';
import PropTypes from 'prop-types';
import { VictoryArea } from 'victory';
import React, { forwardRef } from 'react';
import Chart from 'reactium-ui/Charts/utils/Chart';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: AreaChart
 * -----------------------------------------------------------------------------
 */
let AreaChart = (props, ref) => {
    let { color, data, id, interpolation, opacity, style } = props;

    style = style || {
        data: {
            fill: `url(#${id}-gradient)`,
            fillOpacity: opacity,
            stroke: color,
            strokeWidth: 2,
        },
    };

    const areaProps = {
        data,
        style,
        interpolation,
    };

    return (
        <Chart {...props} ref={ref}>
            <VictoryArea {...areaProps} />
        </Chart>
    );
};

AreaChart = forwardRef(AreaChart);

AreaChart.ENUMS = Chart.ENUMS;

AreaChart.propTypes = {
    ...Chart.propTypes,
    opacity: PropTypes.number,
    style: PropTypes.object,
};

AreaChart.defaultProps = {
    ...Chart.defaultProps,
    dots: true,
    id: uuid(),
    opacity: 0.25,
};

export { AreaChart, AreaChart as default };
