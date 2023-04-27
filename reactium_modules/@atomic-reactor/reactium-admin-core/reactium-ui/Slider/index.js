import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import ENUMS from './enums';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const noop = () => {};

const Label = forwardRef(
    ({ children, className, namespace = 'ar-slider' }, ref) => (
        <div
            className={cn({
                [`${namespace}-tooltip`]: true,
                [className]: !!className,
            })}
            ref={ref}>
            <div className='container'>{children}</div>
        </div>
    ),
);

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Slider
 * -----------------------------------------------------------------------------
 */
let Slider = ({ labelFormat, iDocument, iWindow, value, ...props }, ref) => {
    iDocument =
        !iDocument && typeof document !== 'undefined' ? document : iDocument;
    iWindow = !iWindow && typeof window !== 'undefined' ? window : iWindow;

    // Refs
    const barRef = useRef();
    const containerRef = useRef();
    const handleMaxRef = useRef();
    const handleMinRef = useRef();
    const labelRef = useRef();
    const selRef = useRef();
    const stateRef = useRef({
        max: Math.ceil(op.get(props, ENUMS.MAX, 100)),
        min: Math.floor(op.get(props, ENUMS.MIN, 0)),
        prevState: {},
        range: Boolean(typeof value !== 'number'),
        value,
        ...props,
    });

    // State
    const [handles] = useState({
        [ENUMS.MIN]: handleMinRef,
        [ENUMS.MAX]: handleMaxRef,
    });

    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        // Get the previous state
        const prevState = { ...stateRef.current };

        // Update the stateRef
        stateRef.current = {
            ...prevState,
            ...newState,
            prevState,
        };

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const offset = el => {
        const rect = el.getBoundingClientRect(),
            scrollLeft =
                iWindow.pageXOffset || iDocument.documentElement.scrollLeft,
            scrollTop =
                iWindow.pageYOffset || iDocument.documentElement.scrollTop;

        return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
    };

    const _drag = e => {
        let {
            buffer,
            direction,
            dragging,
            max,
            min,
            range,
            value,
        } = stateRef.current;

        if (!dragging) {
            return;
        }

        if (e.type === 'touchmove') {
            e.clientX = e.touches[0].clientX;
            e.clientY = e.touches[0].clientY;
        }

        const handle = handles[dragging].current;
        const handleW = handle.offsetWidth + 4;
        const handleH = handle.offsetHeight + 4;
        const bar = barRef.current;
        const cont = containerRef.current;
        const lbl = labelRef.current;
        const sel = selRef.current;

        let barW = bar.offsetWidth;
        let barH = bar.offsetHeight;

        let minX = 0;
        let minY = 0;
        let maxX = cont.offsetWidth;
        let maxY = cont.offsetHeight;

        if (range && direction === ENUMS.DIRECTION.HORIZONTAL) {
            maxX =
                dragging === ENUMS.MIN
                    ? handles[ENUMS.MAX].current.offsetLeft - handleW
                    : maxX;
            minX =
                dragging === ENUMS.MAX
                    ? handles[ENUMS.MIN].current.offsetLeft + handleW
                    : minX;
        }

        if (range && direction === ENUMS.DIRECTION.VERTICAL) {
            minY =
                dragging === ENUMS.MIN
                    ? handles[ENUMS.MAX].current.offsetTop + handleH
                    : minY;
            maxY =
                dragging === ENUMS.MAX
                    ? handles[ENUMS.MIN].current.offsetTop - handleH
                    : maxY;
        }

        const x =
            direction === ENUMS.DIRECTION.HORIZONTAL
                ? Math.min(Math.max(minX, e.clientX - offset(cont).left), maxX)
                : 0;

        const y =
            direction === ENUMS.DIRECTION.VERTICAL
                ? Math.min(Math.max(minY, e.clientY - offset(cont).top), maxY)
                : 0;

        const vals = _.range(min, max + 1);

        if (direction === ENUMS.DIRECTION.VERTICAL) {
            vals.reverse();
        }

        const px = x / barW;
        const py = y / barH;

        const len = vals.length - 1;
        let pv = direction === ENUMS.DIRECTION.HORIZONTAL ? px : py;

        pv = Math.floor(pv * len);
        pv = Math.min(pv, len);

        const v = vals[pv];

        value = range ? { ...value, [dragging]: v } : v;

        // Set value when ranged -> based on value.min/max being equal
        if (range && op.has(value, 'max') && op.has(value, 'min')) {
            if (value.min > value.max - buffer) {
                value[dragging] =
                    dragging === ENUMS.MIN
                        ? value[ENUMS.MAX] - buffer
                        : value[ENUMS.MIN] + buffer;
            }
        }

        handle.style.left = `${x}px`;
        handle.style.top = `${y}px`;

        lbl.style.top =
            direction === ENUMS.DIRECTION.HORIZONTAL ? 0 : handle.style.top;
        lbl.style.left =
            direction === ENUMS.DIRECTION.HORIZONTAL
                ? handle.style.left
                : `${handle.offsetWidth}px`;
        lbl.style.display = 'block';

        if (range) {
            if (direction === ENUMS.DIRECTION.HORIZONTAL) {
                const selW =
                    offset(handles[ENUMS.MAX].current).left -
                    offset(handles[ENUMS.MIN].current).left;

                sel.style.left = handles[ENUMS.MIN].current.style.left;
                sel.style.width = `${selW}px`;
            } else {
                const selH =
                    offset(handles[ENUMS.MIN].current).top -
                    offset(handles[ENUMS.MAX].current).top;
                sel.style.top = handles[ENUMS.MAX].current.style.top;
                sel.style.height = `${selH}px`;
            }
        }

        setState({ value });
    };

    const _dragEnd = () => {
        setState({ dragging: null });
        iDocument.removeEventListener('mousemove', _drag);
        iDocument.removeEventListener('mouseup', _dragEnd);
        iDocument.removeEventListener('touchmove', _drag);
        iDocument.removeEventListener('touchend', _dragEnd);
    };

    const _dragStart = e => {
        setState({ dragging: e.target.dataset.handle, focus: e.target });
        iDocument.addEventListener('mousemove', _drag);
        iDocument.addEventListener('mouseup', _dragEnd);
        iDocument.addEventListener('touchmove', _drag);
        iDocument.addEventListener('touchend', _dragEnd);
    };

    const _move = () => {
        const {
            direction,
            dragging,
            onChange,
            range = false,
            value,
        } = stateRef.current;

        if (!dragging) {
            const sel = selRef.current;
            const v = range === true ? value : { min: value };

            Object.entries(v).forEach(([key, value]) => {
                const handle = handles[key].current;
                const pos = _positionFromValue({ handle, value });
                handle.style.left = pos.left;
                handle.style.top = pos.top;
            });

            if (range === true) {
                if (direction === ENUMS.DIRECTION.HORIZONTAL) {
                    const left = Number(
                        handles[ENUMS.MIN].current.style.left
                            .split('%')
                            .join(''),
                    );
                    const right = Number(
                        handles[ENUMS.MAX].current.style.left
                            .split('%')
                            .join(''),
                    );
                    const barW = right - left;

                    sel.style.left = handles[ENUMS.MIN].current.style.left;
                    sel.style.width = `${barW}%`;
                } else {
                    const top = Number(
                        handles[ENUMS.MAX].current.style.top
                            .split('%')
                            .join(''),
                    );
                    const bottom = Number(
                        handles[ENUMS.MIN].current.style.top
                            .split('%')
                            .join(''),
                    );
                    const barH = bottom - top;

                    sel.style.top = handles[ENUMS.MAX].current.style.top;
                    sel.style.height = `${barH}%`;
                }
            }
        }

        onChange({
            type: ENUMS.EVENT.CHANGE,
            value,
        });
    };

    const _onKeyPress = e => {
        const { keyCode } = e;
        const { handle } = e.target.dataset;
        let { max, min, range, value } = stateRef.current;

        let inc;

        switch (keyCode) {
            case 38:
            case 39:
                inc = 1;
                break;

            case 37:
            case 40:
                inc = -1;
                break;
        }

        if (keyCode >= 37 && keyCode <= 40) {
            e.preventDefault();
            e.stopPropagation();

            let v = range ? value[handle] + inc : value + inc;
            v = Math.min(Math.max(min, v), max);

            value = range ? { ...value, [handle]: v } : v;
            setState({ value });
        }
    };

    const _positionFromValue = ({ value }) => {
        const bar = barRef.current;
        const cont = containerRef.current;

        const { direction, max, min } = stateRef.current;
        const vals = _.range(min, max + 1);

        if (direction === ENUMS.DIRECTION.VERTICAL) {
            vals.reverse();
        }

        const len = vals.length - 1;
        const i = vals.indexOf(value);
        const p = Math.ceil((i / len) * 100);

        return direction === ENUMS.DIRECTION.HORIZONTAL
            ? { top: 0, left: `${p}%` }
            : { left: 0, top: `${p}%` };
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        setState,
        state: stateRef.current,
    }));

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    // Side Effect: movement
    useEffect(() => _move(), [stateRef.current.value]);

    // Side Effect: cursor and label
    useEffect(() => {
        const { dragging, snap, value } = stateRef.current;

        if (Boolean(dragging)) {
            iDocument.body.style.cursor = 'grabbing';
        } else {
            iDocument.body.style.cursor = 'default';
            labelRef.current.style.display = 'none';
            if (snap) {
                _move();
            }
        }
    }, [stateRef.current.dragging]);

    // Renderers
    const renderTicks = () => {
        let {
            direction,
            max,
            min,
            namespace,
            tickFormat,
            ticks = [],
        } = stateRef.current;

        if (ticks.length < 1) {
            return null;
        }

        ticks = ticks === true ? [min, max] : ticks;
        ticks.sort();

        if (direction === ENUMS.DIRECTION.VERTICAL) {
            ticks.reverse();
        }

        return (
            <div className={`${namespace}-ticks`}>
                {ticks.map(tick => (
                    <span
                        className={`${namespace}-tick`}
                        style={_positionFromValue({ value: tick })}
                        key={`tick-${tick}`}>
                        {tickFormat(tick)}
                    </span>
                ))}
            </div>
        );
    };

    const render = () => {
        let { value } = stateRef.current;

        const {
            className,
            direction,
            dragging = false,
            name,
            namespace,
            range,
        } = stateRef.current;

        const cname = cn({
            [className]: !!className,
            [namespace]: !!namespace,
            [direction]: !!direction,
        });

        const bcname = `${namespace}-bar`;
        const scname = `${namespace}-range`;
        const maxcname = cn({
            dragging: dragging === ENUMS.MAX,
            [`${namespace}-handle`]: true,
        });
        const mincname = cn({
            dragging: dragging === ENUMS.MIN,
            [`${namespace}-handle`]: true,
        });

        value = range ? value : { [ENUMS.MIN]: value };

        return (
            <div ref={containerRef} className={cname}>
                <input
                    name={name}
                    type='hidden'
                    defaultValue={value[ENUMS.MIN]}
                />
                {range && (
                    <input
                        name={name}
                        type='hidden'
                        defaultValue={value[ENUMS.MAX]}
                    />
                )}
                <div className={bcname} ref={barRef}>
                    <button
                        type='button'
                        className={mincname}
                        ref={handleMinRef}
                        onMouseDown={_dragStart}
                        onTouchStart={_dragStart}
                        onKeyDown={_onKeyPress}
                        data-handle={ENUMS.MIN}
                    />
                    {range === true && op.has(value, 'max') && (
                        <button
                            type='button'
                            className={maxcname}
                            ref={handleMaxRef}
                            onMouseDown={_dragStart}
                            onTouchStart={_dragStart}
                            onKeyDown={_onKeyPress}
                            data-handle={ENUMS.MAX}
                        />
                    )}
                    {range && <div className={scname} ref={selRef} />}
                    <Label ref={labelRef} namespace={namespace}>
                        {labelFormat(value[dragging])}
                    </Label>
                </div>
                {renderTicks()}
            </div>
        );
    };

    return render();
};

Slider = forwardRef(Slider);

Slider.ENUMS = ENUMS;

Slider.propTypes = {
    buffer: PropTypes.number,
    className: PropTypes.string,
    direction: PropTypes.oneOf(Object.values(ENUMS.DIRECTION)),
    labelFormat: PropTypes.func,
    max: PropTypes.number,
    min: PropTypes.number,
    name: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    snap: PropTypes.bool,
    tickFormat: PropTypes.func,
    ticks: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.arrayOf(PropTypes.number),
    ]),
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
            max: PropTypes.number,
            min: PropTypes.number,
        }),
    ]),
};

Slider.defaultProps = {
    buffer: ENUMS.BUFFER,
    direction: ENUMS.DIRECTION.HORIZONTAL,
    labelFormat: label => label,
    min: 0,
    max: 100,
    namespace: 'ar-slider',
    onChange: noop,
    snap: false,
    tickFormat: tick => tick,
    ticks: [],
    value: 0,
    iDocument: typeof document !== 'undefined' ? document : null,
    iWindow: typeof window !== 'undefined' ? window : null,
};

export { Slider, Slider as default };
