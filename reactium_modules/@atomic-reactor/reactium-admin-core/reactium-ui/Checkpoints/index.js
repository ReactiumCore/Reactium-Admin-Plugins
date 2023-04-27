import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import Checkpoint from './Checkpoint';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const noop = () => {};

const ENUMS = {
    ALIGN: {
        TOP: Checkpoint.ALIGN_TOP,
        BOTTOM: Checkpoint.ALIGN_BOTTOM,
    },
    EVENT: {
        CHANGE: 'change',
        COMPLETE: 'complete',
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Checkpoints
 * -----------------------------------------------------------------------------
 */
let Checkpoints = ({ index, points = [], namespace, ...props }, ref) => {
    // Refs
    const containerRef = useRef();
    const prevStateRef = useRef({});
    const stateRef = useRef({
        complete: false,
        index,
        init: false,
        namespace,
        update: Date.now(),
        previous: {},
    });

    // State
    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        prevStateRef.current = stateRef.current;
        stateRef.current.previous = stateRef.current;
        stateRef.current = { ...stateRef.current, ...newState };

        setNewState(stateRef.current);
    };

    const getValue = currIndex => {
        if (currIndex < 0) {
            return null;
        }

        currIndex = currIndex || op.get(stateRef.current, 'index');

        const values = points.map((point, i) => op.get(point, 'value', i));

        let value = values[currIndex];
        value = isNaN(value) && !value ? values : value;

        return value;
    };

    const next = () => {
        let { index } = stateRef.current;
        if (index < points.length) {
            index += 1;
        }

        setState({ index });
    };

    const prev = () => {
        let { index } = stateRef.current;
        if (index > -1) {
            index -= 1;
        }

        setState({ index });
    };

    const complete = () => setState({ index: points.length });

    const restart = () => setState({ index: -1 });

    const onCheckpointChange = (e, index) => {
        const { readOnly } = props;
        if (readOnly === true) {
            return;
        }

        if (e.target.checked) {
            index += 1;
        }

        setState({ index });
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        container: containerRef.current,
        setState,
        state: stateRef.current,
        next,
        prev,
        first: restart,
        last: complete,
        value: getValue(),
        restart, // depricated 0.0.16
        complete, // depricated 0.0.16
    }));

    // Side Effects
    useEffect(() => {
        const {
            index: prevIndex,
            complete: prevComplete,
        } = stateRef.current.previous;

        const { init, index: currIndex } = stateRef.current;

        const complete = currIndex >= points.length;
        const { onChange, onComplete } = props;

        if (prevIndex !== currIndex) {
            const value = getValue(currIndex);

            setState({ value });

            const evt = { type: ENUMS.EVENT.CHANGE, ...state, props, value };
            delete evt.init;

            onChange(evt);
        }

        if (prevComplete !== complete && init === true) {
            setState({ complete });

            if (complete === true) {
                onComplete({ type: ENUMS.EVENT.COMPLETE, state, props });
            }
        }
    }, [props]);

    useLayoutEffect(() => {
        const { init } = stateRef.current;
        if (init !== true) {
            setState({ init: true });
        }
    });

    const cx = suffix => {
        const { namespace } = stateRef.current;
        return `${namespace}-${suffix}`;
    };

    const lineWidth = () => {
        const len = points.length;
        const seg = Math.ceil(100 / len);
        const p = 100 - seg;
        return `${p}%`;
    };

    const activeWidth = () => {
        let { index } = stateRef.current;
        index += 1;

        const len = points.length - 1;
        const p = Math.min(100, Math.ceil((index / len) * 100));
        return `${p}%`;
    };

    const progressWidth = () => {
        let { index = 0 } = stateRef.current;
        if (index === -1) {
            return '0%';
        }

        const len = points.length - 1;
        const p = Math.min(100, Math.ceil((index / len) * 100));
        return `${p}%`;
    };

    const render = () => {
        const { className, labelAlign, name, readOnly } = props;
        const { complete, index, namespace } = stateRef.current;

        const cname = cn({
            [className]: !!className,
            [namespace]: !!namespace,
            readOnly,
        });

        const lw = lineWidth();
        const aw = activeWidth();
        const pw = progressWidth();

        return (
            <div ref={containerRef} className={cname}>
                <div className={cx('line')} style={{ width: lw }} />
                <div className={cx('active')} style={{ width: lw }}>
                    <div style={{ width: aw }} />
                </div>
                <div className={cx('progress')} style={{ width: lw }}>
                    <div style={{ width: pw }} />
                </div>
                {points.map((point, i) => {
                    const { icon, label, value, ...cprops } = point;
                    const width = `${100 / points.length}%`;
                    let key = `checkpoint-${i}`;
                    key += name || '';

                    return (
                        <Checkpoint
                            style={{ width }}
                            key={key}
                            name={name}
                            label={label}
                            labelAlign={labelAlign}
                            value={value || i}
                            checked={i < index || complete === true}
                            disabled={i > index && readOnly === true}
                            onChange={e => onCheckpointChange(e, i)}
                            {...cprops}>
                            {icon}
                        </Checkpoint>
                    );
                })}
            </div>
        );
    };

    return render();
};

Checkpoints = forwardRef(Checkpoints);

Checkpoints.ENUMS = ENUMS;

Checkpoints.propTypes = {
    className: PropTypes.string,
    index: PropTypes.number,
    labelAlign: PropTypes.oneOf(Object.values(ENUMS.ALIGN)),
    name: PropTypes.string,
    namespace: PropTypes.string,
    points: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.node,
            icon: PropTypes.node,
            value: PropTypes.any,
        }),
    ),
    readOnly: PropTypes.bool,
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
};

Checkpoints.defaultProps = {
    namespace: 'ar-checkpoints',
    index: -1,
    labelAlign: ENUMS.ALIGN.BOTTOM,
    points: [],
    readOnly: false,
    onChange: noop,
    onComplete: noop,
};

export { Checkpoints, Checkpoints as default, Checkpoint };
