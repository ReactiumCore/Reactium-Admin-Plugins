import PropTypes from 'prop-types';
import { VictoryPie } from 'victory';
import React, { forwardRef } from 'react';

const labelFunc = ({ label, x, y }) => label || x || y;

const mapData = data =>
    data.map(({ label, value, ...props }) => ({
        y: value,
        x: label,
        label,
        ...props,
    }));

let PieChart = (
    { animate, colors, data, innerRadius, labelFunc, padding, ...props },
    ref,
) => {
    const chartProps = {
        animate,
        colorScale: colors,
        cornerRadius: 1,
        data: mapData(data),
        innerRadius,
        labelRadius: 160,
        labels: labelFunc,
        padAngle: padding,
        ...props,
    };

    return <VictoryPie {...chartProps} ref={ref} />;
};

PieChart = forwardRef(PieChart);

// See: https://formidable.com/open-source/victory/docs/victory-pie#props
//      for additional props
PieChart.propTypes = {
    animate: PropTypes.bool,
    colors: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    data: PropTypes.array,
    innerRadius: PropTypes.number,
    labelFunc: PropTypes.func,
    padding: PropTypes.number,
    style: PropTypes.object,
};

PieChart.defaultProps = {
    animate: false,
    colors: 'grayscale',
    innerRadius: 120,
    labelFunc,
    padding: 2,
    style: {
        labels: {
            fontSize: 10,
        },
    },
};

export { PieChart, PieChart as default };
