import _ from 'underscore';
import cn from 'classnames';
import moment from 'moment';
import op from 'object-path';
import Picker from '../Picker';
import { Feather } from '../Icon';
import PropTypes from 'prop-types';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const noop = () => {};

const formatTime = str => {
    const lookups = [
        /((1[0-2]|0?[1-9]):([0-5][0-9]):([0-5][0-9]) ?([AaPp][Mm]))/gi,
        /((1[0-2]|0?[1-9]):([0-5][0-9]):([0-5][0-9])?([AaPp][Mm]))/gi,
        /((1[0-2]|0?[1-9]):([0-5][0-9]):([0-5][0-9]) ?([AaPp]))/gi,
        /((1[0-2]|0?[1-9]):([0-5][0-9]):([0-5][0-9])?([AaPp]))/gi,
        /((1[0-2]|0?[1-9]):([0-5][0-9])?([AaPp][Mm]))/gi,
        /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/gi,
        /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp]))/gi,
        /((1[0-2]|0?[1-9]):([0-5][0-9])?([AaPp]))/gi,
    ];

    let match;

    while (lookups.length > 0 && !match) {
        let regex = lookups[0];
        match = String(str).match(regex);

        if (Array.isArray(match)) {
            match = String(match[0]);
            match = match.split(' ').join(':');
            match = match.replace(/([AaPp][Mm])/gi, ' $1').trim();
            match = match.replace(/([AaPp]$)/gi, ' $1M');
            match = match.split(': ').join(' ');
            match = match.toUpperCase();
        }

        lookups.shift();
    }

    return match || str;
};

const DEBUG = false;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: TimePicker
 * -----------------------------------------------------------------------------
 */
let TimePicker = ({ iDocument, iWindow, ...props }, ref) => {
    // Refs
    const ampmRef = useRef();
    const containerRef = useRef();
    const hourRef = useRef();
    const minuteRef = useRef();
    const pickerRef = useRef();
    const secondsRef = useRef();
    const stateRef = useRef({
        ival: null,
        prevState: {},
        value: props.value ? formatTime(props.value) : null,
        ...props,
    });

    // State
    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = (newState, caller) => {
        // Get the previous state
        const prevState = { ...stateRef.current };

        let { value } = newState;

        if (value) {
            newState.value = formatTime(value);
        }

        // Update the stateRef
        stateRef.current = {
            ...prevState,
            ...newState,
            prevState,
        };

        if (DEBUG) {
            console.log('setstate()', caller, stateRef.current);
        }

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    // External Interface
    const _handle = () => ({
        Picker: pickerRef.current,
        setState,
        state: stateRef.current,
    });

    const [handle, setHandle] = useState(_handle());

    // External Interface
    useImperativeHandle(ref, () => handle, [handle]);

    // Side Effects
    useEffect(() => {
        if (!pickerRef.current) return;
        if (!handle.Picker) {
            handle.Picker = pickerRef.current;
            setHandle(_handle());
        }
    }, [pickerRef.current]);

    useEffect(() => setState(props, 'useEffect()'), Object.values(props));

    useLayoutEffect(() => {
        const container = pickerRef.current.container;
        container.addEventListener('keydown', _onKeyPress);
        container.addEventListener('keyup', _onTimeSetRelease);

        return function cleanup() {
            container.removeEventListener('keydown', _onKeyPress);
            container.removeEventListener('keyup', _onTimeSetRelease);
        };
    });

    const _onInputFocus = e => {
        const refs = [hourRef, minuteRef, secondsRef, ampmRef];
        let { index, type, values } = e.target.dataset;

        index = Number(index);
        values = values
            .split(',')
            .map(item => (isNaN(item) ? item : Number(item)));

        const value = isNaN(e.target.value)
            ? e.target.value
            : Number(e.target.value);

        const active = {
            ref: refs[index].current,
            selection: index,
            value,
            values,
        };

        setState({ active }, '_onInputFocus()');
    };

    const _onKeyPress = e => {
        const keys = [40, 38];

        if (keys.includes(e.keyCode)) {
            e.preventDefault();

            pickerRef.current.show();
            const inc = e.keyCode === 38 ? 1 : -1;
            try {
                _onTimeSet(inc);
            } catch (err) {}
        }
    };

    const _onPickerInputChange = e => {
        const { value } = e;
        const { onChange } = stateRef.current;
        setState({ value }, '_onPickerInputChange()');
        onChange({ ...e, value });
    };

    const _onTimeSet = inc => {
        let { active, ival, selected } = stateRef.current;

        if (!active && hourRef.current) {
            _onInputFocus({ target: hourRef.current });
            setTimeout(() => _onTimeSet(inc), 1);
            return;
        }

        let { selection = null, value, values = [] } = active;

        value = isNaN(value) ? value : Number(value);

        inc = Number(inc);

        const curr = values.indexOf(value);
        let index = curr + inc;
        index = index < 0 ? values.length - 1 : index;
        index = index === values.length ? 0 : index;

        value = values[index];
        value = isNaN(value) ? value : value < 10 ? `0${value}` : value;

        active.ref.value = value;
        selected[selection] = value;

        let pval = formatTime(
            selected
                .join(':')
                .split(':PM')
                .join(' PM')
                .split(':AM')
                .join(' AM'),
        );

        if (ival) {
            clearInterval(ival);
        }

        ival = setInterval(() => _onTimeSet(inc), 250);

        setState({ value: pval, ival }, '_onTimeSet()');

        _onInputFocus({ target: active.ref });
        _onPickerInputChange({
            type: 'change',
            target: pickerRef.current.input,
            value: pval,
        });
    };

    const _onTimeSetRelease = () => {
        const { ival } = stateRef.current;

        if (ival) {
            clearInterval(ival);
        }
    };

    // Renderers
    const renderUI = (provided, snapshot) => {
        let { active, namespace, selected = [], value } = stateRef.current;

        value = !value ? moment().format('LT') : value;

        if (typeof value === 'string') {
            value = String(value)
                .split(' ')
                .join(':');

            selected = _.compact(value.split(':'));
            stateRef.current.selected = selected;
        }

        if (selected.length < 2) {
            return null;
        }

        const cname = cn({
            [namespace]: !!namespace,
        });

        const refs = [hourRef, minuteRef, secondsRef, ampmRef];
        const seconds = selected.length > 3;
        const nums = selected.filter(item => !isNaN(item));
        const len = selected.length - 1;
        const activeIndex = active ? active.selection : null;

        const elms = selected.map((v, i) => {
            if (isNaN(v)) {
                // string
                return (
                    <span key={`time-piece-${i}`}>
                        <input
                            ref={refs[i]}
                            maxLength={2}
                            data-index={i}
                            data-restrict='[^pm|^am]'
                            data-type='string'
                            data-values='AM,PM'
                            readOnly
                            type='text'
                            value={v || ''}
                            onChange={noop}
                            onClick={_onInputFocus}
                            onFocus={_onInputFocus}
                            className={cn({ active: activeIndex === i })}
                        />
                    </span>
                );
            } else {
                // number
                const cname = cn({
                    colon: i !== len && i !== nums.length - 1,
                });
                const max = i === 0 ? 13 : 60;
                const min = i === 0 ? 1 : 0;
                const values = _.range(min, max);
                v = Number(v) < 10 && v.length < 2 ? `0${v}` : v;
                v = String(v).substr(0, 2);

                return (
                    <span key={`time-piece-${i}`} className={cname}>
                        <input
                            ref={refs[i]}
                            maxLength={2}
                            data-index={i}
                            data-restrict='[a-zA-Z]'
                            data-type='number'
                            data-values={values.join(',')}
                            readOnly
                            type='text'
                            value={v || ''}
                            onChange={noop}
                            onClick={_onInputFocus}
                            onFocus={_onInputFocus}
                            className={cn({ active: activeIndex === i })}
                        />
                    </span>
                );
            }
        });

        return (
            <div ref={containerRef} className={cname}>
                <div className={`${namespace}-nav`}>
                    <button
                        type='button'
                        onMouseDown={() => _onTimeSet(1)}
                        onMouseUp={_onTimeSetRelease}>
                        <Feather.ChevronUp />
                    </button>
                </div>
                <div className={`${namespace}-input`}>
                    {elms.map(item => item)}
                </div>
                <div className={`${namespace}-nav`}>
                    <button
                        type='button'
                        onMouseDown={() => _onTimeSet(-1)}
                        onMouseUp={_onTimeSetRelease}>
                        <Feather.ChevronDown />
                    </button>
                </div>
            </div>
        );
    };

    const render = () => {
        let {
            className,
            id,
            icon,
            name,
            picker = {},
            placeholder,
            readOnly,
            style = {},
            width,
            value,
        } = stateRef.current;

        style = { ...style, width };

        return (
            <Picker
                placeholder={placeholder}
                icon={icon}
                id={id}
                {...picker}
                name={name}
                readOnly={readOnly}
                children={renderUI}
                ref={pickerRef}
                className={className}
                style={style}
                iDocument={iDocument}
                iWindow={iWindow}
                value={value}
                onChange={_onPickerInputChange}
            />
        );
    };

    return render();
};

TimePicker = forwardRef(TimePicker);

TimePicker.formatTime = formatTime;

TimePicker.propTypes = {
    className: PropTypes.string,
    icon: PropTypes.shape({
        closed: PropTypes.node,
        opened: PropTypes.node,
    }),
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    picker: PropTypes.shape(Picker.propTypes),
    readOnly: PropTypes.bool,
    style: PropTypes.object,
    value: PropTypes.string,
    width: PropTypes.number,
};

TimePicker.defaultProps = {
    namespace: 'ar-timepicker',
    onChange: noop,
    style: {},
    width: 180,
    icon: {
        closed: <Feather.Clock />,
        opened: <Feather.Clock />,
    },
    picker: {},
    placeholder: 'Select Time',
    readOnly: false,
};

export { TimePicker, TimePicker as default };
