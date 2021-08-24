import _ from 'underscore';
import moment from 'moment';
import cn from 'classnames';
import op from 'object-path';
import { Scrollbars } from 'react-custom-scrollbars';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import Reactium, {
    __,
    useBreakpoint,
    useDerivedState,
    useEventHandle,
    useFulfilledObject,
    useHandle,
    useHookComponent,
    useIsContainer,
    useWindowSize,
} from 'reactium-core/sdk';

let ActivityChart = (props, ref) => {
    let { ActivityLog, className, log = [], namespace } = props;

    const calendarRef = useRef();
    const containerRef = useRef();
    const collapsibleRef = useRef();
    const toolbarRef = useRef();

    const { breakpoint, width } = useWindowSize();

    const isContainer = useIsContainer();

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
            style: { width: 80, paddingLeft: 0, paddingRight: 0 },
            color: Button.ENUMS.COLOR.SECONDARY,
        },
        data: undefined,
        expanded: false,
        filter: props.filter,
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
        visible: true,
    });

    const [ready] = useFulfilledObject(state, ['data']);

    const dismiss = ({ target }) => {
        if (unMounted()) return;
        if (!state.expanded) return;
        if (isContainer(target, toolbarRef.current)) return;

        handle.Calendar.collapse();
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const onDateChange = ({ selected }) => {
        if (!Array.isArray(selected)) return;
        if (selected.length < 1) return;

        const selectDate = new Date(selected[0]);
        setState({ selectDate });
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

    const unMounted = () => !containerRef.current;

    const _handle = () => ({
        Calendar: {
            collapse: () => collapsibleRef.current.collapse(),
            expand: () => collapsibleRef.current.expand(),
            toggle: () => collapsibleRef.current.toggle(),
        },
        setState,
        state,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);

    useEffect(() => {
        const { selectDate: date, filter } = state;
        setState({
            data: getData({
                date,
                filter,
                log: ActivityLog.filter({ date, filter }),
            }),
        });
    }, [state.filter, state.selectDate]);

    useEffect(() => {
        op.set(
            { ...state },
            'buttonProps.size',
            breakpoint !== 'xs' ? Button.ENUMS.SIZE.SM : Button.ENUMS.SIZE.XS,
        );

        const direction = !['xs', 'sm'].includes(breakpoint)
            ? Collapsible.ENUMS.DIRECTION.HORIZONTAL
            : Collapsible.ENUMS.DIRECTION.VERTICAL;

        setState({ ...state, visible: true, direction });
    }, [breakpoint]);

    useEffect(() => {
        window.addEventListener('mousedown', dismiss);
        window.addEventListener('touchstart', dismiss);

        return () => {
            window.removeEventListener('mousedown', dismiss);
            window.removeEventListener('touchstart', dismiss);
        };
    }, [collapsibleRef.current]);

    useEffect(() => {
        const type = state.visible ? 'show' : 'hide';
        const evt = new Event(type);
        handle.dispatchEvent(evt);
    }, [state.visible]);

    const render = () => {
        const tickY = ticks('y');

        const collapseIcon =
            state.direction === Collapsible.ENUMS.DIRECTION.HORIZONTAL
                ? 'Feather.ArrowLeft'
                : 'Feather.ArrowUp';

        const filters = ['recent', 'week', 'month', 'year'];

        return (
            <div
                className={cn(cx(), className, { hidden: !state.visible })}
                ref={containerRef}>
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
                                        xAxis={{ offsetY: 50, tickCount: 14 }}
                                        xAxisStyle={state.style.x}
                                        yAxis={{
                                            tickCount: 8,
                                            tickFormat: t => (t < 0 ? '' : t),
                                            tickValues: tickY,
                                            padding: { bottom: 20 },
                                        }}
                                        yAxisStyle={state.style.y}
                                        yLabel={__('Updates')}
                                    />
                                )}
                            </div>
                        </Scrollbars>
                        <div className='toolbar' ref={toolbarRef}>
                            <div className='btn-group'>
                                {filters.map(filter => (
                                    <Button
                                        {...state.buttonProps}
                                        active={state.filter === filter}
                                        key={filter}
                                        onClick={() => setState({ filter })}>
                                        {filter}
                                    </Button>
                                ))}
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
                                                : 'Feather.Calendar'
                                        }
                                        className='ico'
                                        size={state.expanded ? 18 : 14}
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
                                    <Button
                                        className={cx('dismiss-btn')}
                                        color={Button.ENUMS.COLOR.CLEAR}
                                        onClick={() =>
                                            handle.Calendar.collapse()
                                        }
                                    />
                                    <Calendar
                                        maxDate={new Date()}
                                        onChange={e => onDateChange(e)}
                                        ref={calendarRef}
                                        selected={[
                                            moment(state.selectDate).format(
                                                'L',
                                            ),
                                        ]}
                                        value={state.selectDate}
                                    />
                                </Collapsible>
                            </div>
                        </div>
                        <Button
                            className={cx('close-btn')}
                            color={Button.ENUMS.COLOR.CLEAR}
                            onClick={() => ActivityLog.close()}>
                            <Icon name='Feather.X' />
                        </Button>
                        <Button
                            className={cx('collapse-btn')}
                            color={Button.ENUMS.COLOR.CLEAR}
                            onClick={() => setState({ visible: false })}>
                            <Icon name={collapseIcon} />
                        </Button>
                    </>
                )}
                {!ready && <Spinner />}
            </div>
        );
    };

    return render();
};

ActivityChart = forwardRef(ActivityChart);

ActivityChart.defaultProps = {
    log: [],
    namespace: 'activity-log-chart',
};

const getData = ({ log, filter, date: today = new Date() }) => {
    const agg = (lbl, obj) => {
        if (!op.has(obj, lbl)) op.set(obj, lbl, { x: lbl, y: 0 });
        let y = Number(op.get(obj, [lbl, 'y'], 0)) + 1;
        op.set(obj, [lbl, 'y'], y);
        return obj;
    };

    let defaults, frmt;

    switch (filter) {
        case 'year':
            frmt = 'MM/YYYY';
            defaults = _.times(12, m => {
                let t = moment(today);
                return t.subtract(m, 'month').format(frmt);
            })
                .reverse()
                .reduce((obj, date) => {
                    obj[date] = { y: 0, x: date };
                    return obj;
                }, {});
            break;

        case 'month':
            frmt = 'MM/DD';
            defaults = _.range(1, moment(today).format('D')).reduce(
                (obj, day) => {
                    let t = moment(today).date(day);
                    const date = t.format(frmt);
                    obj[date] = { y: 0, x: date };
                    return obj;
                },
                {},
            );
            break;

        case 'week':
            frmt = 'ddd';
            defaults = {
                SUN: { y: 0, x: 'SUN' },
                MON: { y: 0, x: 'MON' },
                TUE: { y: 0, x: 'TUE' },
                WED: { y: 0, x: 'WED' },
                THU: { y: 0, x: 'THU' },
                FRI: { y: 0, x: 'FRI' },
                SAT: { y: 0, x: 'SAT' },
            };
            break;

        default:
            frmt = 'L';
            defaults = {};
    }

    return Object.values(
        log.reduce((obj, { updatedAt }) => {
            return agg(moment(updatedAt).format(frmt), obj);
        }, defaults),
    );
};

export default ActivityChart;
