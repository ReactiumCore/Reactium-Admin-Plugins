import _ from 'underscore';
import cn from 'classnames';
import moment from 'moment';
import op from 'object-path';
import PropTypes from 'prop-types';
import Button from 'reactium-ui/Button';
import { Feather } from 'reactium-ui/Icon';
import ENUMS from './enums';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const noop = () => {};

const DaysInMonth = (d, expanded) => {
    const startDay = !expanded
        ? moment(d)
              .clone()
              .startOf('week')
        : moment(d)
              .clone()
              .startOf('month')
              .startOf('week');

    const endDay = !expanded
        ? moment(d)
              .clone()
              .endOf('week')
        : moment(d)
              .clone()
              .endOf('month')
              .endOf('week');

    const date = startDay.clone().subtract(1, 'day');
    const calendar = [];
    while (date.isBefore(endDay, 'day')) {
        calendar.push(
            Array(7)
                .fill(0)
                .map(() => date.add(1, 'day').clone()),
        );
    }

    return _.flatten(calendar);
};

const Day = ({
    children,
    className,
    checked,
    date,
    dateFormat,
    dayName,
    disabled,
    first,
    last,
    name,
    now,
    onChange,
}) =>
    disabled ? (
        <div className={cn({ [className]: true, disabled, now })}>
            <span className='text'>{children}</span>
        </div>
    ) : (
        <label
            className={cn({
                [className]: true,
                checked,
                'checked-first': first,
                'checked-last': last,
                [dayName]: !!dayName,
                now,
            })}>
            <input
                name={name}
                type='checkbox'
                value={date.format(dateFormat)}
                checked={checked}
                onChange={onChange}
            />
            <span className='text'>{children}</span>
            <span className='bg' />
        </label>
    );

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Calendar
 * -----------------------------------------------------------------------------
 */
let Calendar = ({ namespace, ...props }, ref) => {
    // Refs
    const containerRef = useRef();
    const prevStateRef = useRef({ updated: Date.now() });
    const stateRef = useRef({
        ...props,
        init: false,
    });

    // State
    const [state, setNewState] = useState(stateRef.current);
    const [prevState, setPrevState] = useState(prevStateRef.current);

    // Internal Interface
    const setState = (newState, caller) => {
        if (op.has(newState, 'value')) {
            const { dateFormat, multiple, range } = stateRef.current;

            if (range) {
                const v = newState.value.split(' - ');
                v.sort();

                const date = new Date(v[0]);

                newState['selected'] = v.map(d =>
                    moment(new Date(d)).format(dateFormat),
                );
                newState['date'] = date;
            } else if (multiple) {
                const v = newState.value
                    .split(' ')
                    .join('')
                    .split(',');
                v.sort();

                const date = new Date(v[0]);

                newState['selected'] = v.map(d =>
                    moment(new Date(d)).format(dateFormat),
                );
                newState['date'] = date;
            }
        }

        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        if (ENUMS.DEBUG) {
            console.log('setstate()', caller, stateRef.current);
        }

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const _ns = str => `${namespace}-${str}`;

    const _onCheckToggle = e => {
        let { dateFormat, multiple, range, selected = [] } = stateRef.current;
        const { checked, value } = e.target;

        if (range && selected.length >= 2) {
            selected = [];
        }

        if (checked && !range && !multiple) {
            selected = [];
        }

        if (checked) {
            selected.push(value);
        } else {
            selected = _.without(selected, value);
        }

        selected.sort();

        setState({ selected, updated: Date.now() }, '_onCheckToggle()');
    };

    const _next = (duration = 'months') => {
        let { date, onNav, onNext } = stateRef.current;
        date = moment(date)
            .add(1, duration)
            .toDate();
        setState({ date }, 'Calendar -> _next(' + duration + ')');

        onNext({ type: ENUMS.EVENT.NEXT, ...stateRef.current });
        onNav({ type: ENUMS.EVENT.NAV, ...stateRef.current });
    };

    const _prev = (duration = 'months') => {
        let { date, onNav, onPrev } = stateRef.current;
        date = moment(date)
            .subtract(1, duration)
            .toDate();
        setState({ date }, 'Calendar -> _prev(' + duration + ')');

        onPrev({ type: ENUMS.EVENT.PREV, ...stateRef.current });
        onNav({ type: ENUMS.EVENT.NAV, ...stateRef.current });
    };

    const _today = () => {
        const { onNav } = stateRef.current;
        const date = moment().toDate();
        setState({ date }, 'Calendar -> _today()');
        onNav({ type: ENUMS.EVENT.TODAY, ...stateRef.current });
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        setState,
        state,
        next: _next,
        prev: _prev,
        today: _today,
        ...ref,
    }));

    // Side Effects
    useEffect(
        () => setState(props, 'Calendar -> useEffect()'),
        Object.values(props),
    );

    useEffect(() => {
        const { init, onChange, onInit, selected = [] } = state;
        const { selected: prevSelected = [] } = prevState;

        setPrevState({ ...JSON.parse(JSON.stringify(stateRef.current)) });

        if (init === true && !_.isEqual(prevSelected, selected)) {
            onChange({ type: ENUMS.EVENT.CHANGE, ...stateRef.current });
        }

        if (init === false) {
            stateRef.current.init = true;
            onInit({ type: ENUMS.EVENT.INIT, ...stateRef.current });
        }
    }, [state.updated]);

    const renderDays = () => {
        const {
            date,
            dateFormat,
            maxDate,
            minDate,
            multiple,
            name,
            range,
            selected = [],
        } = stateRef.current;
        const days = DaysInMonth(date, true);
        const today = moment().format('L');

        return (
            <div className={_ns('days')}>
                {days.map((day, i) => {
                    let disabled = false;
                    disabled =
                        minDate && day.isBefore(minDate) ? true : disabled;
                    disabled =
                        maxDate && day.isAfter(maxDate) ? true : disabled;

                    const k = `${_ns('day')}-${day.format('YYYY-MM-DD')}-${i}`;
                    const now = today === day.format('L');
                    const idx = selected.indexOf(day.format(dateFormat));
                    const first = !multiple && idx === 0;
                    const last = !multiple && idx === selected.length - 1;

                    let checked = idx > -1;

                    if (range) {
                        if (!checked) {
                            let min = _.first(selected);
                            let max = _.last(selected);

                            min = min && moment(new Date(min));
                            max = max && moment(new Date(max));

                            if (min && !max) {
                                checked = day.isAfter(min);
                            }

                            if (!min && max) {
                                checked = day.isBefore(max);
                            }

                            if (min && max) {
                                checked = day.isAfter(min) && day.isBefore(max);
                            }
                        }
                    }

                    const dayProps = {
                        date: day,
                        dateFormat,
                        dayName: String(day.format('ddd')).toLowerCase(),
                        disabled,
                        checked,
                        className: _ns('day'),
                        children: day.format('D'),
                        first,
                        last: last && idx > -1,
                        name,
                        now,
                        onChange: _onCheckToggle,
                    };

                    return <Day key={k} {...dayProps} />;
                })}
            </div>
        );
    };

    const renderHeader = () => {
        const { date, header, headerFormat, nav } = stateRef.current;
        const color = Button.ENUMS.COLOR.CLEAR;
        const label = moment(date).format(headerFormat);
        const isize = 14;
        const size = Button.ENUMS.SIZE.XS;

        return !header ? null : (
            <div className={_ns('header')}>
                {nav && (
                    <Button
                        color={color}
                        size={size}
                        onClick={() => _prev('years')}>
                        <Feather.ChevronLeft width={isize} height={isize} />
                    </Button>
                )}
                <Button
                    readOnly
                    size={size}
                    color={color}
                    className='flex-grow'>
                    {label}
                </Button>
                {nav && (
                    <Button
                        color={color}
                        size={size}
                        onClick={() => _next('years')}>
                        <Feather.ChevronRight width={isize} height={isize} />
                    </Button>
                )}
            </div>
        );
    };

    const renderLabels = () => {
        const { labelFormat, labels } = stateRef.current;

        return !Array.isArray(labels) || labels.length < 1 ? null : (
            <div className={_ns('labels')}>
                {labels.map((label, i) => (
                    <div
                        key={`${_ns('labels')}-label-${label}-${i}`}
                        className={_ns('label')}>
                        {labelFormat(label)}
                    </div>
                ))}
            </div>
        );
    };

    const renderNav = () => {
        const { date, nav } = stateRef.current;
        const color = Button.ENUMS.COLOR.CLEAR;
        const isize = 14;
        const size = Button.ENUMS.SIZE.XS;

        return !nav ? null : (
            <div className={_ns('footer')}>
                <Button
                    color={color}
                    size={size}
                    onClick={() => _prev('months')}>
                    <Feather.ChevronLeft width={isize} height={isize} />
                </Button>
                <Button
                    size={size}
                    color={color}
                    onClick={() => _today()}
                    className='flex-grow'>
                    Today
                </Button>
                <Button
                    color={color}
                    size={size}
                    onClick={() => _next('months')}>
                    <Feather.ChevronRight width={isize} height={isize} />
                </Button>
            </div>
        );
    };

    const render = () => {
        const { align, className, id } = stateRef.current;
        const cname = cn({
            [namespace]: !!namespace,
            [className]: !!className,
            [_ns(align)]: !!align,
        });

        return (
            <div ref={containerRef} className={cname} id={id}>
                {renderHeader()}
                {renderNav()}
                {renderLabels()}
                {renderDays()}
            </div>
        );
    };

    return render();
};

Calendar = forwardRef(Calendar);

Calendar.propTypes = {
    align: PropTypes.oneOf(Object.values(ENUMS.ALIGN)),
    className: PropTypes.string,
    date: PropTypes.instanceOf(Date),
    dateFormat: PropTypes.string,
    header: PropTypes.bool,
    headerFormat: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    labeFormat: PropTypes.func,
    labels: PropTypes.array,
    maxDate: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    multiple: PropTypes.bool,
    name: PropTypes.string,
    namespace: PropTypes.string,
    nav: PropTypes.bool,
    onChange: PropTypes.func,
    onInit: PropTypes.func,
    onNav: PropTypes.func,
    onNext: PropTypes.func,
    onPrev: PropTypes.func,
    range: PropTypes.bool,
    selected: PropTypes.array,
};

Calendar.defaultProps = {
    align: ENUMS.ALIGN.CENTER,
    dateFormat: ENUMS.FORMAT.DATE,
    header: true,
    headerFormat: ENUMS.FORMAT.HEADER,
    labelFormat: label => label,
    labels: ENUMS.LABELS,
    multiple: false,
    namespace: 'ar-datepicker-calendar',
    nav: true,
    onChange: noop,
    onInit: noop,
    onNav: noop,
    onNext: noop,
    onPrev: noop,
    range: false,
    selected: [],
};

export { Calendar as default };
