import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import Dismissable from '../Dismissable';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

import ReactDOM from 'react-dom';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Modal
 * -----------------------------------------------------------------------------
 */
let Modal = (props, ref) => {
    // Refs
    const bodyRef = useRef();
    const windowRef = useRef();
    const dissmissableRef = useRef();
    const stateRef = useRef({
        animation: null,
        ...props,
        overflow: 'auto',
    });

    // State
    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        stateRef.current = { ...stateRef.current, ...newState };
        setNewState(stateRef.current);
    };

    const toggleWindow = (locked = false) => {
        const body = bodyRef.current;
        const window = windowRef.current;

        if (locked === true) {
            window.scroll(window.scrollX, window.scrollY);
            body.style.overflowY = 'hidden';
        } else {
            const { overflow } = stateRef.current;
            body.style.overflow = overflow;
        }

        const style = body.style;
    };

    const dismiss = () => {
        toggleWindow(false);
        const { dismissable } = stateRef.current;

        if (dismissable) {
            dissmissableRef.current
                .hide()
                .then(() => setState({ children: null }));
        }
    };

    const update = content => {
        if (content) {
            setState({ children: content });
        }
    };

    const show = content => {
        toggleWindow(true);
        update(content);
        dissmissableRef.current.show();
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        ...dissmissableRef.current,
        dismiss,
        hide: dismiss,
        show,
        setState,
        state: stateRef.current,
        update,
    }));

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useLayoutEffect(() => {
        const doc = op.get(props, 'iDocument', document);
        const win = op.get(props, 'iWindow', window);

        if (!bodyRef.current) {
            bodyRef.current = doc.body;
            const overflow = op.get(doc.body, 'style.overflow', 'auto');

            setState({ overflow });
        }

        if (!windowRef.current) {
            windowRef.current = win;
        }
    }, [bodyRef.current, windowRef.current]);

    const render = () => {
        if (!bodyRef.current) {
            return null;
        }

        const {
            children,
            className,
            dismissable,
            namespace,
            visible = false,
        } = stateRef.current;

        const cname = cn({
            [className]: !!className,
            visible,
        });

        return ReactDOM.createPortal(
            <Dismissable
                {...stateRef.current}
                ref={dissmissableRef}
                className={cname}>
                {dismissable && (
                    <button
                        type='button'
                        className={`${namespace}-bg`}
                        onClick={dismiss}
                    />
                )}
                {!dismissable && <div className={`${namespace}-bg`} />}
                <div className={`${namespace}-wrapper`}>
                    <div className={`${namespace}-content`}>{children}</div>
                </div>
            </Dismissable>,
            bodyRef.current,
        );
    };

    return render();
};

Modal = forwardRef(Modal);

Modal.propTypes = {
    ...Dismissable.propTypes,
    dismissable: PropTypes.bool,
};

Modal.defaultProps = {
    ...Dismissable.defaultProps,
    dismissable: true,
    namespace: 'ar-modal',
};

export { Modal, Modal as default };
