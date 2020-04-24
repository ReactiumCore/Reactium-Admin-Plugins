import _ from 'underscore';
import moment from 'moment';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

import Reactium, {
    __,
    useBreakpoint,
    useDerivedState,
    useFulfilledObject,
    useHandle,
    useHookComponent,
    useWindowSize,
} from 'reactium-core/sdk';

const getData = ({ log, filter, today = new Date() }) => {
    log = _.sortBy(log, 'createdAt');

    today = moment(today);

    const agg = (lbl, obj) => {
        if (!op.has(obj, lbl)) op.set(obj, lbl, { x: lbl, y: 0 });
        let y = Number(op.get(obj, [lbl, 'y'], 0)) + 1;
        op.set(obj, [lbl, 'y'], y);
        return obj;
    };

    let match, frmt;

    switch (filter) {
        case 'years':
            match = today.format('YYYY');
            frmt = 'MM/YYYY';
            const defaultMonths = _.times(12, m => {
                let t = moment(today);
                return t.subtract(m, 'month').format(frmt);
            })
                .reverse()
                .reduce((obj, date) => {
                    obj[date] = { y: 0, x: date };
                    return obj;
                }, {});

            return Object.values(
                log.reduce((obj, item) => {
                    const { createdAt } = item;
                    const date = moment(createdAt);
                    const m = date.format('YYYY');
                    if (m !== match) return obj;
                    const lbl = date.format(frmt);
                    return agg(lbl, obj);
                }, defaultMonths),
            );

        case 'months':
            match = today.format('MM');
            frmt = 'MM';
            const defaultDays = _.times(today.endOf('month').format('D'), m => {
                let t = moment(today);
                return t.subtract(m, 'day').format(frmt);
            })
                .reverse()
                .reduce((obj, date) => {
                    obj[date] = { y: 0, x: date };
                    return obj;
                }, {});

            return Object.values(
                log.reduce((obj, item) => {
                    const { createdAt } = item;
                    const date = moment(createdAt);
                    const m = date.format(frmt);
                    if (m !== match) return obj;
                    const lbl = date.format('MM/DD');
                    return agg(lbl, obj);
                }, {}),
            );

        case 'weeks':
            match = today.format('w');
            return Object.values(
                log.reduce(
                    (obj, item) => {
                        const { createdAt } = item;
                        const date = moment(createdAt);
                        const m = date.format('w');
                        if (m !== match) return obj;
                        const lbl = String(date.format('ddd')).toUpperCase();
                        return agg(lbl, obj);
                    },
                    {
                        SUN: { y: 0, x: 'SUN' },
                        MON: { y: 0, x: 'MON' },
                        TUE: { y: 0, x: 'TUE' },
                        WED: { y: 0, x: 'WED' },
                        THU: { y: 0, x: 'THU' },
                        FRI: { y: 0, x: 'FRI' },
                        SAT: { y: 0, x: 'SAT' },
                    },
                ),
            );

        default:
            return Object.values(
                log.reduce((obj, item) => {
                    const { createdAt } = item;
                    const date = moment(createdAt);
                    const lbl = date.format('L');
                    return agg(lbl, obj);
                }, {}),
            );
    }
};

const ActivityChart = props => {
    let { className, log = [], namespace } = props;

    const containerRef = useRef();
    const collapsibleRef = useRef();

    const { breakpoint } = useWindowSize();

    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');

    const {
        AreaChart,
        Button,
        Calendar,
        Collapsible,
        DatePicker,
        Icon,
        Spinner,
    } = useHookComponent('ReactiumUI');

    const [state, setNewState] = useDerivedState({
        buttonProps: {
            color: Button.ENUMS.COLOR.SECONDARY,
        },
        data: undefined,
        expanded: false,
        filter: 'days',
        selectDate: new Date(),
        style: {
            dots: {
                data: {
                    fill: AreaChart.ENUMS.COLORS['color-white'],
                    stroke: AreaChart.ENUMS.COLORS['color-blue'],
                    strokeWidth: 2,
                },
                labels: {
                    fontSize: 8,
                    fill: AreaChart.ENUMS.COLORS['color-grey'],
                },
            },
            x: {
                axisLabel: {
                    fontSize: 6,
                    fill: AreaChart.ENUMS.COLORS['color-gray'],
                },
                grid: {
                    stroke: AreaChart.ENUMS.COLORS['color-gray-dark'],
                    opacity: 1,
                },
                ticks: {
                    stroke: AreaChart.ENUMS.COLORS['color-gray'],
                    opacity: 0.75,
                    size: 5,
                },
                tickLabels: {
                    fontSize: 4,
                    padding: 5,
                    fill: AreaChart.ENUMS.COLORS['color-grey'],
                },
            },
            y: {
                axisLabel: {
                    fontSize: 6,
                    fill: AreaChart.ENUMS.COLORS['color-gray'],
                },
                grid: {
                    stroke: AreaChart.ENUMS.COLORS['color-gray-dark'],
                    opacity: 1,
                },
                ticks: {
                    stroke: AreaChart.ENUMS.COLORS['color-gray'],
                    opacity: 0,
                    size: 5,
                },
                tickLabels: {
                    fontSize: 4,
                    padding: 5,
                    fill: AreaChart.ENUMS.COLORS['color-grey'],
                },
            },
        },
        toolbarCollapse: false,
    });

    const [ready] = useFulfilledObject(state, ['data']);

    const cx = Reactium.Utils.cxFactory(namespace);

    const onDateChange = ({ selected }) => {
        if (!Array.isArray(selected)) return;
        const selectDate = new Date(selected[0]);
        setState({ selectDate });
        collapsibleRef.current.collapse();
    };

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const ticks = (axis, chunk = 4) => {
        const vals = _.pluck(state.data, axis);
        const max = _.max(vals) + chunk;
        chunk = max < 10 ? 1 : chunk;

        return _.range(-chunk, max, chunk);
    };

    const toggleToolbar = () =>
        setState({ toolbarCollapse: !state.toolbarCollapse });

    const unMounted = () => !containerRef.current;

    useEffect(() => {
        if (!state.data) {
            setState({ data: getData({ log, today: state.selectDate }) });
        }
    }, [state.data]);

    useEffect(() => {
        setState({
            data: getData({
                log,
                filter: state.filter,
                today: state.selectDate,
            }),
        });
    }, [state.filter, state.selectDate]);

    useEffect(() => {
        op.set(
            { ...state },
            'buttonProps.size',
            breakpoint !== 'xs' ? Button.ENUMS.SIZE.SM : Button.ENUMS.SIZE.XS,
        );
        setState(state);
    }, [breakpoint]);

    const render = () => {
        const tick = ticks('y');
        return (
            <div className={cn(cx(), className)} ref={containerRef}>
                {!ready && <Spinner />}
                {ready && (
                    <>
                        <Scrollbars>
                            <div className='chart'>
                                {state.data.length > 0 && (
                                    <AreaChart
                                        data={state.data}
                                        dotStyle={state.style.dots}
                                        height={320}
                                        onClick={console.log}
                                        xAxis={{ offsetY: 50, tickCount: 12 }}
                                        xAxisStyle={state.style.x}
                                        yAxis={{
                                            tickCount: 8,
                                            tickFormat: t => (t < 0 ? '' : t),
                                            tickValues: tick,
                                            padding: { bottom: 20 },
                                        }}
                                        yAxisStyle={state.style.y}
                                        yLabel={__('Updates')}
                                    />
                                )}
                            </div>
                        </Scrollbars>
                        <div className='toolbar'>
                            <div className='btn-group'>
                                <Button
                                    {...state.buttonProps}
                                    style={{ width: 40, padding: 0 }}
                                    onClick={() => {
                                        Modal.hide();
                                    }}>
                                    <Icon name='Feather.X' size={16} />
                                </Button>
                                <Button
                                    {...state.buttonProps}
                                    active={state.filter === 'days'}
                                    onClick={() =>
                                        setState({ filter: 'days' })
                                    }>
                                    Recent
                                </Button>
                                <Button
                                    {...state.buttonProps}
                                    active={state.filter === 'weeks'}
                                    onClick={() =>
                                        setState({ filter: 'weeks' })
                                    }>
                                    Week
                                </Button>
                                <Button
                                    {...state.buttonProps}
                                    active={state.filter === 'months'}
                                    onClick={() =>
                                        setState({ filter: 'months' })
                                    }>
                                    Month
                                </Button>
                                <Button
                                    {...state.buttonProps}
                                    active={state.filter === 'years'}
                                    onClick={() =>
                                        setState({ filter: 'years' })
                                    }>
                                    Year
                                </Button>
                                <Button
                                    {...state.buttonProps}
                                    style={{ width: 40, padding: 0 }}
                                    onClick={() =>
                                        collapsibleRef.current.toggle()
                                    }>
                                    <Icon
                                        name={
                                            state.expanded
                                                ? 'Feather.ChevronUp'
                                                : 'Linear.Calendar31'
                                        }
                                        className='ico'
                                        size={16}
                                    />
                                </Button>
                            </div>
                            <div className='date-select'>
                                <Collapsible
                                    ref={collapsibleRef}
                                    expanded={state.expanded}
                                    onCollapse={e =>
                                        setState({
                                            expanded: false,
                                        })
                                    }
                                    onExpand={e =>
                                        setState({
                                            expanded: true,
                                        })
                                    }>
                                    <Calendar
                                        value={state.selectDate}
                                        maxDate={new Date()}
                                        onChange={e => onDateChange(e)}
                                        selected={[
                                            moment(state.selectDate).format(
                                                'L',
                                            ),
                                        ]}
                                    />
                                </Collapsible>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };
    return render();
};

ActivityChart.defaultProps = {
    log: [],
    namespace: 'activity-log-chart',
};

export default ActivityChart;
