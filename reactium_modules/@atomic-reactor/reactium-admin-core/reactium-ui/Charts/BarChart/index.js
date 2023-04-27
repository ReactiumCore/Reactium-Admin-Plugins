import uuid from 'uuid/v4';
import PropTypes from 'prop-types';
import { VictoryBar } from 'victory';
import React, { forwardRef } from 'react';
import Colors from 'reactium-ui/colors';
import Chart from 'reactium-ui/Charts/utils/Chart';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: BarChart
 * -----------------------------------------------------------------------------
 */
let BarChart = (props, ref) => {
    const { data, style } = props;

    const barProps = {
        data,
        style,
    };

    return (
        <Chart {...props} ref={ref}>
            <VictoryBar {...barProps} />
        </Chart>
    );
};

BarChart = forwardRef(BarChart);

BarChart.ENUMS = Chart.ENUMS;

BarChart.propTypes = {
    ...Chart.propTypes,
    style: PropTypes.object,
};

BarChart.defaultProps = {
    ...Chart.defaultProps,
    dots: false,
    id: uuid(),
    style: {
        data: {
            fill: Chart.defaultProps.color,
            fillOpacity: 0.25,
            stroke: Chart.defaultProps.color,
            strokeWidth: 2,
        },
    },
    xAxisStyle: {
        ...Chart.defaultProps.xAxisStyle,
        axis: { stroke: Colors['color-grey-light'], strokeWidth: 3 },
    },
    yAxisStyle: {
        ...Chart.defaultProps.yAxisStyle,
        axisLabel: {
            fontSize: 9,
            padding: 36,
        },
        ticks: {
            stroke: Colors['color-grey-light'],
            opacity: 0.75,
            size: 15,
        },
        tickLabels: {
            fontSize: 7,
            padding: 5,
        },
    },
};

export { BarChart, BarChart as default };
