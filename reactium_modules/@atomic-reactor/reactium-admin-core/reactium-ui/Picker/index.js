import cn from 'classnames';
import PropTypes from 'prop-types';
import Dismissable from '../Dismissable';
import { Feather } from '../Icon';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Picker
 * -----------------------------------------------------------------------------
 */

let Picker = (
    {
        children,
        className,
        formatter,
        icon,
        iDocument,
        iWindow,
        namespace,
        onBeforeHide = noop,
        onBeforeShow = noop,
        onChange = noop,
        onDismiss = noop,
        onFocus = noop,
        onHide = noop,
        onKeyDown = noop,
        onShow = noop,
        selected,
        visible: defaultVisible,
        ...props
    },
    ref,
) => {
    // Refs
    const containerRef = useRef();
    const inputRef = useRef();
    const selectRef = useRef();
    const stateRef = useRef({
        prevState: {},
        selected,
        visible: defaultVisible,
        ...props,
    });

    // State
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

    const isChild = child => {
        if (!child) {
            return true;
        }

        const parent = containerRef.current;
        let node = child.parentNode;
        while (node !== null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };

    const dismiss = e => {
        if (!e) {
            return hide({ ref });
        }

        const evt = { ...e, ref };

        return !isChild(e.target) ? hide(evt) : Promise.resolve(evt);
    };

    const hide = e => {
        const { disabled } = stateRef.current;
        if (disabled === true) {
            return;
        }

        const select = selectRef.current;
        return select.hide().then(() => {
            setState({ visible: false });
            return e;
        });
    };

    const show = e => {
        const { disabled } = stateRef.current;
        if (disabled === true) {
            return;
        }

        const evt = { ...e, ref };
        const select = selectRef.current;
        return select.show().then(() => {
            setState({ visible: true });
            return evt;
        });
    };

    const toggle = e => {
        const { visible } = stateRef.current;
        return visible ? hide(e) : show(e);
    };

    const handler = () => ({
        ...ref,
        container: containerRef.current,
        dismissable: selectRef.current,
        dismiss,
        hide,
        input: inputRef.current,
        isChild,
        show,
        setState,
        state: stateRef.current,
        toggle,
    });

    // External Interface
    useImperativeHandle(ref, handler);

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useLayoutEffect(() => {
        const win = iWindow || window;
        const doc = iDocument || document;

        win.addEventListener('mousedown', dismiss);
        doc.addEventListener('keydown', _onKeyDown);

        if (win) {
            return function cleanup() {
                win.removeEventListener('mousedown', dismiss);
                doc.removeEventListener('keydown', _onKeyDown);
            };
        }
    });

    const _onFocus = e => show(e).then(evt => onFocus(evt));

    const _onInputChange = e => {
        const value = formatter(e.target.value);
        setState({ value });
        onChange({ ...e, value });
    };

    const _onKeyDown = e => {
        if (isChild(e.target)) {
            switch (e.keyCode) {
                case 27:
                    e.preventDefault();
                    hide();

                    break;
            }
        }

        onKeyDown(e);
    };

    // Renderers
    const render = () => {
        let { disabled, focus, value, visible } = stateRef.current;

        visible = disabled === true ? false : visible;

        const cname = cn({
            [className]: !!className,
            [namespace]: !!namespace,
            focus: visible,
        });

        const scname = cn({
            [`${namespace}-select`]: !!namespace,
        });

        const dismissProps = {
            className: scname,
            ref: selectRef,
            onBeforeHide,
            onBeforeShow,
            onDismiss,
            onHide,
            onShow,
            visible,
        };

        const Icon = icon ? () => (visible ? icon.opened : icon.closed) : null;

        return (
            <span ref={containerRef} className={cname}>
                <input
                    {...props}
                    ref={inputRef}
                    value={value || ''}
                    onChange={_onInputChange}
                    onFocus={_onFocus}
                    onKeyDown={_onKeyDown}
                />
                <button type='button' onClick={toggle} disabled={disabled}>
                    {Icon && <Icon />}
                </button>
                <Dismissable {...dismissProps}>
                    {children(handler(), stateRef.current)}
                </Dismissable>
            </span>
        );
    };

    return render();
};

Picker = forwardRef(Picker);

Picker.propTypes = {
    children: PropTypes.func,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    formatter: PropTypes.func,
    icon: PropTypes.shape({
        closed: PropTypes.node,
        opened: PropTypes.node,
    }),
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    namespace: PropTypes.string,
    onBeforeHide: PropTypes.func,
    onBeforeShow: PropTypes.func,
    onChange: PropTypes.func,
    onDismiss: PropTypes.func,
    onHide: PropTypes.func,
    onKeyDown: PropTypes.func,
    onShow: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    selected: PropTypes.any,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.array,
        PropTypes.object,
    ]),
};

Picker.defaultProps = {
    formatter: val => val,
    icon: {
        closed: <Feather.ChevronDown />,
        opened: <Feather.ChevronUp />,
    },
    namespace: 'ar-picker',
    onBeforeHide: noop,
    onBeforeShow: noop,
    onChange: noop,
    onDismiss: noop,
    onHide: noop,
    onKeyDown: noop,
    onShow: noop,
    onFocus: noop,
    selected: null,
    value: null,
};

export { Picker, Picker as default };
