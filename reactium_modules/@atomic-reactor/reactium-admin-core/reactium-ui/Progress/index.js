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

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Progress
 * -----------------------------------------------------------------------------
 */
let Progress = ({ children, ...props }, ref) => {
    // Refs
    const containerRef = useRef();
    const prevStateRef = useRef();
    const stateRef = useRef({
        ...props,
    });

    // State
    const [state, setNewState] = useState(stateRef.current);
    const [prevState, setPrevState] = useState(prevStateRef.current);

    // Internal Interface
    const setState = newState => {
        prevStateRef.current = { ...stateRef.current };
        stateRef.current = { ...stateRef.current, ...newState };
        setPrevState(prevStateRef.current);
        setNewState(stateRef.current);
    };

    const _onChange = e => {
        const { onChange } = stateRef.current;
        onChange(e);
    };

    const _onComplete = e => {
        const { onComplete } = stateRef.current;
        onComplete(e);
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        container: containerRef.current,
        setState,
        state: stateRef.current,
        value: op.get(stateRef.current, 'value'),
    }));

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useEffect(() => {
        const { value } = stateRef.current;
        if (op.get(prevState, 'value') !== value) {
            const percent = Math.min(100, Math.ceil(value * 100));
            const evt = {
                type: ENUMS.EVENT.CHANGE,
                value,
                percent,
                target: containerRef.current,
            };
            _onChange(evt);

            if (percent === 100) {
                _onComplete({ ...evt, type: ENUMS.EVENT.COMPLETE });
            }
        }
    }, [state.value]);

    const render = () => {
        const {
            appearance,
            className,
            color,
            name,
            namespace,
            size,
            value = 0,
        } = stateRef.current;

        const cname = cn({
            [size]: !!size,
            [color]: !!color,
            [namespace]: !!namespace,
            [className]: !!className,
            [appearance]: !!appearance,
        });

        const width = Math.min(100, value * 100) + '%';

        return (
            <div ref={containerRef} className={cname}>
                {name && (
                    <input
                        type='hidden'
                        value={value}
                        name={name}
                        onChange={_onChange}
                    />
                )}
                <div className='bar' style={{ width }}>
                    {children && <span className='label'>{children}</span>}
                </div>
            </div>
        );
    };

    return render();
};

Progress = forwardRef(Progress);

Progress.ENUMS = ENUMS;

Progress.propTypes = {
    appearance: PropTypes.oneOf(Object.values(ENUMS.APPEARANCE)),
    className: PropTypes.string,
    color: PropTypes.oneOf(Object.values(ENUMS.COLOR)),
    name: PropTypes.string,
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
    size: PropTypes.oneOf(Object.values(ENUMS.SIZE)),
    value: PropTypes.number,
};

Progress.defaultProps = {
    color: ENUMS.COLOR.PRIMARY,
    namespace: 'ar-progress',
    onChange: noop,
    onComplete: noop,
    value: 0,
};

export { Progress, Progress as default };
