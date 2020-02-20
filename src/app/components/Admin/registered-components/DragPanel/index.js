import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import Portal from 'components/common-ui/Portal';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';
import Reactium, {
    useDerivedState,
    useEventHandle,
    useIsContainer,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useLayoutEffect;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: DragPanel
 * -----------------------------------------------------------------------------
 */
let Panel = (initialProps, ref) => {
    const {
        autohide,
        children,
        handle: Handle,
        id: initialId,
        parent: initialParent,
        visible: isVisible,
        ...props
    } = initialProps;

    const initialState = { ...props, reset: false };

    // Refs
    const containerRef = useRef();

    const dragRef = useRef();

    const dismissableRef = useRef();

    // Initial state
    const [state, setNewState] = useDerivedState(initialState);

    const [prevState, setPrevState] = useDerivedState(initialState);

    // isContainer
    const isContainer = useIsContainer();

    // content
    const [content, setNewContent] = useState(children);

    // id
    const [id, setNewId] = useState(initialId);

    // parent
    const [parent, setNewParent] = useState(initialParent);

    // position
    const [position, setPosition] = useState(defaultPosition(id, state));

    // visible
    const [visible, setVisible] = useState(isVisible);

    // Functions
    const adjustPosition = (adjustX, adjustY, ID) => {
        if (!containerRef.current || !parent) return;

        const { dragProps, gutter } = state;
        const bounds = op.get(dragProps, 'bounds', { right: 0, bottom: 0 });
        const {
            width: docWidth,
            height: docHeight,
        } = parent.getBoundingClientRect();

        let {
            x,
            y,
            width,
            height,
        } = containerRef.current.getBoundingClientRect();

        x = adjustX || x;
        y = adjustY || y;

        const maxX = docWidth - width - gutter;
        const maxY = docHeight - height - gutter;
        const minX = gutter;
        const minY = gutter;

        if (
            bounds.right !== maxX ||
            bounds.bottom !== maxY ||
            adjustX ||
            adjustY
        ) {
            dragProps.bounds = {
                top: gutter,
                left: gutter,
                right: maxX,
                bottom: maxY,
            };

            const newState = { dragProps, update: Date.now(), reset: false };

            if (
                y > maxY ||
                y < minY ||
                x > maxX ||
                x < minX ||
                adjustX ||
                adjustY
            ) {
                newState.reset = true;
            }

            position.x = x > maxX ? maxX : x;
            position.y = y > maxY ? maxY : y;

            position.y = Math.max(position.y, minY);
            position.y = Math.min(position.y, maxY);
            position.x = Math.max(position.x, minX);
            position.x = Math.min(position.x, maxX);

            if (ID) {
                Reactium.Prefs.set(`admin.position.${ID}`, position);
            }

            setPosition(position);
            setState(newState);
        }
    };

    const autoHidePanel = e => {
        const container = containerRef.current;
        if (!container || visible !== true || autohide !== true) return;
        if (isContainer(e.target, container)) return;
        hide(true, true);
    };

    // classname and namespace
    const cname = () => {
        const { className, namespace } = state;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    // className prefixer
    const cx = cls =>
        _.chain([op.get(state, 'className', op.get(state, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const hide = (animate = true, empty = false) => {
        handle.dispatchEvent(new Event('beforehide'));

        const container = containerRef.current;

        if (container && animate === true) {
            const { animationEase, animationSpeed } = state;

            TweenMax.to(container, animationSpeed, {
                ease: animationEase,
                opacity: 0,
                onComplete: () => {
                    setVisible(false);
                    if (empty === true) {
                        setNewContent(null);
                    }
                },
            });
        } else {
            setVisible(false);
            if (empty === true) {
                setNewContent(null);
            }
        }

        return handle;
    };

    const moveTo = (x, y, ID) => {
        adjustPosition(x, y, ID);
        return handle;
    };

    const setContent = children => {
        setNewContent('');
        setNewContent(children);
        adjustPosition();
        return handle;
    };

    const setID = ID => {
        if (!ID) return handle;
        const { x, y } = Reactium.Prefs.get(`admin.position.${ID}`, position);

        setNewId(ID);
        moveTo(x, y, ID);

        return handle;
    };

    const setParent = value => {
        setNewParent(value);
        return handle;
    };

    const setState = newState => {
        setNewState(newState);
        return handle;
    };

    const show = (animate = true) => {
        handle.dispatchEvent(new Event('beforeshow'));

        const container = containerRef.current;

        if (container && animate === true) {
            const { animationEase, animationSpeed } = state;

            container.style.display = 'flex';

            TweenMax.to(container, animationSpeed, {
                ease: animationEase,
                opacity: 1,
                onComplete: () => setVisible(true),
            });
        } else {
            setVisible(true);
        }

        return handle;
    };

    const toggle = () => {
        handle.dispatchEvent(new Event('beforeshow'));
        return visible === true ? hide() : show();
    };

    // Handle
    const _handle = () => ({
        container: containerRef.current,
        content,
        hide,
        id,
        moveTo,
        position,
        prevState,
        props: initialProps,
        setContent,
        setID,
        setParent,
        setPrevState,
        setState,
        show,
        state,
        toggle,
        visible,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    // handlers
    const _onDrag = e => {
        let {
            x,
            y,
            width,
            height,
        } = containerRef.current.getBoundingClientRect();

        const maxX = window.outerWidth - width - 8;
        const maxY = window.outerHeight - height - 8;

        x = Math.max(x, 8);
        x = Math.min(x, maxX);
        y = Math.max(y, 8);
        y = Math.min(y, maxY);

        Reactium.Prefs.set(`admin.position.${id}`, { x, y });

        handle.dispatchEvent(new MouseEvent('drag', e));
    };

    const _onStart = e => handle.dispatchEvent(new MouseEvent('dragstart', e));

    const _onStop = e => handle.dispatchEvent(new MouseEvent('dragstop', e));

    const _onContentChange = () =>
        handle.dispatchEvent(new CustomEvent('content'));

    const _onStateChange = (state, prevState) =>
        handle.dispatchEvent(new CustomEvent('change', { state, prevState }));

    const _onResize = () => adjustPosition();

    // Side effects
    // window resize listener
    useEffect(() => {
        adjustPosition();
        window.addEventListener('resize', _onResize);
        return () => {
            window.removeEventListener('resize', _onResize);
        };
    }, [containerRef.current, content]);

    // clear position rest
    useEffect(() => {
        if (state.reset === true) {
            setState({ reset: false });
        }
    }, [state.reset]);

    // content change event dispatch
    useEffect(() => {
        if (content === children) return;
        //setHandle(_handle());
        _onContentChange();
    }, [content]);

    // state change event dispatch
    useEffect(() => {
        if (_.isEqual(state, prevState)) return;
        //setHandle(_handle());
        _onStateChange(state, prevState);
        setPrevState(state);
    }, [state]);

    // visible toggle
    useEffect(() => {
        //setHandle(_handle());

        if (visible === true) {
            handle.dispatchEvent(new Event('show'));
        } else {
            handle.dispatchEvent(new Event('hide'));
        }
        handle.dispatchEvent(new Event('toggle'));
    }, [visible]);

    // update handle
    useEffect(() => {
        setHandle(_handle());
    }, [content, state, visible, id]);

    // auto hide
    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.addEventListener('mousedown', autoHidePanel);
        window.addEventListener('touchstart', autoHidePanel);

        return () => {
            window.removeEventListener('mousedown', autoHidePanel);
            window.removeEventListener('touchstart', autoHidePanel);
        };
    });

    // Renderers
    const render = () => {
        const { className, disabled, dragProps = {}, reset = false } = state;

        dragProps.defaultPosition = position;
        dragProps.onDrag = _onDrag;
        dragProps.onStart = _onStart;
        dragProps.onStop = _onStop;
        dragProps.disabled = disabled;

        if (reset === true) {
            dragProps.position = position;
        } else {
            delete dragProps.position;
        }

        if (className) {
            op.set(dragProps, 'defaultClassName', cx());
            op.set(dragProps, 'defaultClassNameDragged', cx('dragged'));
            op.set(dragProps, 'defaultClassNameDragging', cx('dragging'));
        }

        const style = {
            display: visible === false ? 'none' : 'flex',
            opacity: visible === false ? 0 : 1,
        };

        return (
            <Portal target={parent}>
                <Draggable {...dragProps} ref={ref}>
                    <div
                        id={id}
                        ref={containerRef}
                        children={content}
                        style={style}>
                        <Handle />
                        <div className='content'>{content}</div>
                    </div>
                </Draggable>
            </Portal>
        );
    };

    return render();
};

Panel = forwardRef(Panel);

Panel.propTypes = {
    animationEase: PropTypes.object,
    animationSpeed: PropTypes.number,
    autohide: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    dragProps: PropTypes.object,
    id: PropTypes.string.isRequired,
    namespace: PropTypes.string,
    visible: PropTypes.bool,
};

Panel.defaultProps = {
    animationEase: Power2.easeInOut,
    animationSpeed: 0.25,
    autohide: false,
    disabled: false,
    dragProps: {
        defaultClassName: 'ar-panel',
        defaultClassNameDragged: 'ar-panel-dragged',
        defaultClassNameDragging: 'ar-panel-dragging',
        handle: '.ar-dialog-header',
    },
    gutter: 8,
    handle: () => <div className='handle' />,
    id: uuid(),
    namespace: 'ar-drag-panel',
    visible: false,
};

export { Panel as default };

// Helpers
const defaultPosition = (id, state) => ({
    x: op.get(
        state,
        'dragProps.defaultPosition.x',
        Reactium.Prefs.get(`admin.position.${id}.x`, 100),
    ),
    y: op.get(
        state,
        'dragProps.defaultPosition.y',
        Reactium.Prefs.get(`admin.position.${id}.y`, 100),
    ),
});
