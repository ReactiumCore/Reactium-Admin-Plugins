import _ from 'underscore';
import cn from 'classnames';
import moment from 'moment';
import ENUMS from './enums';
import op from 'object-path';
import Picker from '../Picker';
import { Feather } from '../Icon';
import PropTypes from 'prop-types';
import Calendar from './Calendar';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';
import uuid from 'uuid/v4';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const noop = () => {};

const stateToPickerProps = ({
    className,
    icon,
    iDocument,
    iWindow,
    multiple,
    name,
    namespace,
    onChange,
    picker = {},
    placeholder,
    readOnly,
    style = {},
    width,
    value,
}) => ({
    className,
    icon,
    iDocument,
    iWindow,
    name,
    onChange,
    placeholder,
    readOnly: multiple || readOnly,
    style: { ...style, width },
    value,
    ...picker,
});

const stateToCalendarProps = ({
    align,
    calendar = {},
    date,
    dateFormat,
    labels,
    maxDate,
    minDate,
    multiple,
    nav,
    range,
    selected,
    value,
}) => ({
    align,
    date: !date && value ? new Date(value) : date,
    dateFormat,
    labels,
    maxDate,
    minDate,
    multiple,
    nav,
    range,
    selected: (!selected || selected.length < 1) && value ? [value] : selected,
    value,
    ...calendar,
});

/**
 * -----------------------------------------------------------------------------
 * Hook Component: DatePicker
 * -----------------------------------------------------------------------------
 */
let DatePicker = ({ iDocument, iWindow, ...props }, ref) => {
    // Refs
    const calendarRef = useRef();
    const containerRef = useRef();
    const pickerRef = useRef();
    const stateRef = useRef({
        ...props,
    });

    // State
    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = (newState, caller) => {
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

    const _onCalendarChange = e => {
        let { date, multiple, onChange, range, value } = stateRef.current;

        if (range) {
            value = e.selected.join(' - ');
            date = new Date(_.first(e.selected));
        }

        if (multiple && !range) {
            value = e.selected.join(', ');
            date = new Date(_.first(e.selected));
        }

        if (!multiple && !range) {
            value = _.first(e.selected);
        }

        setState(
            { date, value, selected: e.selected },
            'DatePicker -> _onCalendarChange()',
        );
        onChange(e);
    };

    const _validate = value => {
        const {
            dateFormat,
            maxDate,
            minDate,
            multiple,
            range,
        } = stateRef.current;

        const match = range ? `${dateFormat} - ${dateFormat}` : dateFormat;

        if (!moment(value, match, true).isValid()) {
            return false;
        }

        if (range && !multiple) {
            let varr = value.split(' - ');
            varr.sort();

            let sd = new Date(varr[0]);
            let ed = new Date(varr[1]);

            if (sd > ed) {
                return false;
            }

            if (maxDate) {
                if (
                    moment(sd).isAfter(maxDate) ||
                    moment(ed).isAfter(maxDate)
                ) {
                    return false;
                }
            }

            if (minDate) {
                if (
                    moment(sd).isBefore(minDate) ||
                    moment(ed).isBefore(minDate)
                ) {
                    return false;
                }
            }
        }

        if (!range && !multiple) {
            let d = new Date(value);

            if (maxDate && moment(d).isAfter(maxDate)) {
                return false;
            }

            if (minDate && moment(d).isBefore(minDate)) {
                return false;
            }
        }

        return true;
    };

    const _onCalendarNav = e => {
        const { date, type } = e;
        const { dateFormat } = stateRef.current;

        stateRef.current.date = date;
    };

    const _onPickerInput = e => {
        let { keyCode, type, value } = e;
        const { date, dateFormat, range } = stateRef.current;

        const specialKeys = [13];

        if (specialKeys.includes(keyCode) && !value) {
            value = e.target.value;
        }

        if (!value || !_validate(value)) {
            return;
        }

        let d, selected;

        if (range) {
            selected = value
                .split(' - ')
                .map(d => moment(new Date(d)).format(dateFormat));
            selected.sort();
            d = new Date(selected[0]);
        } else {
            d = new Date(value);
            selected = [moment(d).format(dateFormat)];
        }

        const newState = {
            date: d,
            selected,
            value,
        };

        setState(newState, 'DatePicker -> _onPickerInput()');
    };

    const _onPickerInputChange = _.throttle(_onPickerInput, 250, {
        leading: false,
    });

    const _handle = () => ({
        Picker: pickerRef.current,
        setState,
        state: stateRef.current,
    });

    const [handle, setHandle] = useState(_handle());

    // External Interface
    useImperativeHandle(ref, () => handle, [handle]);

    useEffect(() => {
        if (!pickerRef.current) return;
        if (!handle.Picker) {
            handle.Picker = pickerRef.current;
            setHandle(_handle());
        }
    }, [pickerRef.current]);

    // Side Effects
    useEffect(
        () => setState(props, 'DatePicker -> useEffect()'),
        Object.values(props),
    );

    const renderUI = (provided, snapshot) => {
        const { dateFormat, id } = stateRef.current;
        const calendarProps = stateToCalendarProps({
            ...stateRef.current,
            iDocument,
            iWindow,
        });

        return (
            <Calendar
                id={`calendar-${id}`}
                {...calendarProps}
                ref={calendarRef}
                onChange={_onCalendarChange}
                onNav={_onCalendarNav}
            />
        );
    };

    const render = () => {
        const { id } = stateRef.current;
        const pickerProps = stateToPickerProps({
            ...stateRef.current,
            iDocument,
            iWindow,
        });

        return (
            <Picker
                id={`picker-${id}`}
                {...pickerProps}
                children={renderUI}
                ref={pickerRef}
                onChange={_onPickerInputChange}
                onKeyDown={_onPickerInputChange}
            />
        );
    };

    return render();
};

DatePicker = forwardRef(DatePicker);

DatePicker.ENUMS = ENUMS;

DatePicker.propTypes = {
    align: PropTypes.oneOf(Object.values(ENUMS.ALIGN)),
    calendar: PropTypes.shape(Calendar.propTypes),
    className: PropTypes.string,
    date: PropTypes.instanceOf(Date),
    dateFormat: PropTypes.string,
    icon: PropTypes.shape({
        closed: PropTypes.node,
        opened: PropTypes.node,
    }),
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    labels: PropTypes.array,
    maxDate: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    name: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    namespace: PropTypes.string,
    nav: PropTypes.bool,
    onChange: PropTypes.func,
    picker: PropTypes.shape(Picker.propTypes),
    readOnly: PropTypes.bool,
    selected: PropTypes.array,
    style: PropTypes.object,
    value: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

DatePicker.defaultProps = {
    align: ENUMS.ALIGN.CENTER,
    calendar: {},
    dateFormat: 'L',
    icon: {
        closed: <Feather.Calendar />,
        opened: <Feather.Calendar />,
    },
    id: uuid(),
    multiple: false,
    namespace: 'ar-datepicker',
    nav: true,
    onChange: noop,
    picker: {},
    placeholder: 'Select Date',
    range: false,
    readOnly: false,
    selected: [],
    style: {},
    width: '100%',
};

export { DatePicker, DatePicker as default, Calendar };
