import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';

import ENUMS from './enums';

import ReactDOM from 'react-dom';
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect as useWindowEffect,
    useRef,
} from 'react';

import { useDerivedState } from '@atomic-reactor/reactium-sdk-core';

const noop = () => {};

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Tooltip
 * -----------------------------------------------------------------------------
 */
let Tooltip = ({ onHide, onShow, ...props }, ref) => {
    // Refs
    const bodyRef = useRef();
    const containerRef = useRef();

    const [state, setState] = useDerivedState({
        timer: null,
        ...props,
    });

    const getPosition = ({ align, verticalAlign, element }) => {
        let x = 0,
            y = 0;

        const w = element.offsetWidth;
        const h = element.offsetHeight;
        const rect = element.getBoundingClientRect();

        switch (align) {
            case ENUMS.ALIGN.LEFT:
                x = rect.x;
                break;

            case ENUMS.ALIGN.CENTER:
                x = rect.x + w / 2;
                break;

            case ENUMS.ALIGN.RIGHT:
                x = rect.x + w;
                break;
        }

        switch (verticalAlign) {
            case ENUMS.VERTICAL_ALIGN.TOP:
                y = rect.y;
                break;

            case ENUMS.VERTICAL_ALIGN.MIDDLE:
                y = rect.y + h / 2;
                break;

            case ENUMS.VERTICAL_ALIGN.BOTTOM:
                y = rect.y + h;
                break;
        }

        y += window.scrollY;
        x += window.scrollX;

        return { x: Math.floor(x), y: Math.floor(y) };
    };

    const unMounted = () => !containerRef.current;

    const hide = e => {
        if (unMounted()) return;

        const { autohide } = e;
        const element = e.target;
        const { tooltip } = element.dataset;

        if (tooltip) {
            let { timer } = state;

            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            if (!autohide) {
                element.removeEventListener('mouseleave', hide);
                element.removeEventListener('focus', hide);
            }

            setState({
                visible: false,
                timer,
                align: props.align || Tooltip.defaultProps.align,
                verticalAlign:
                    props.verticalAlign || Tooltip.defaultProps.verticalAlign,
            });

            onHide({ event: ENUMS.EVENT.HIDE, target: e.target, ref });
        }
    };

    const show = e => {
        const dataset = e.target.dataset;
        const element = e.target;

        if (!element) {
            return;
        }

        const { tooltip } = dataset;

        let title =
            element.getAttribute('title') ||
            element.getAttribute('aria-title') ||
            tooltip;
        title = typeof title === 'boolean' ? null : title;

        if (!title || !tooltip) {
            return;
        }

        let {
            align: defaultAlign,
            autohide: defaultAutohide,
            timer,
            verticalAlign: defaultVerticalAlign,
        } = state;

        if (timer) {
            clearTimeout(timer);
        }

        const align = op.get(dataset, 'align', defaultAlign);
        const autohide = op.get(dataset, 'autohide', defaultAutohide);
        const verticalAlign = op.get(
            dataset,
            'verticalAlign',
            defaultVerticalAlign,
        );

        // Give screen readers a chance to read the title before we clip it off.
        // setTimeout(() => element.removeAttribute('title'), 1);
        element.removeAttribute('title');
        if (!element.getAttribute('aria-title')) {
            element.setAttribute('aria-title', title);
        }

        const newState = { visible: true, children: title };

        if (align && Object.values(ENUMS.ALIGN).includes(align)) {
            newState.align = align;
        }

        if (
            verticalAlign &&
            Object.values(ENUMS.VERTICAL_ALIGN).includes(verticalAlign)
        ) {
            newState.verticalAlign = verticalAlign;
        }

        dataset.tooltip = title;

        // position the tooltip to the target element
        const pos = getPosition({ align, verticalAlign, element, e });

        containerRef.current.style.left = `${pos.x}px`;
        containerRef.current.style.top = `${pos.y}px`;

        element.addEventListener('mouseleave', hide);
        element.addEventListener('focus', hide);

        if (autohide) {
            timer = setTimeout(
                () => hide({ target: element, autohide: true }),
                autohide,
            );
            newState.timer = timer;
        }

        onShow({ event: ENUMS.EVENT.SHOW, target: e.target, ref });

        setState(newState);
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        hide,
        setState,
        show,
        state: state,
    }));

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useLayoutEffect(() => {
        // const win = op.has(props, 'iWindow') ? props.iWindow : window;
        const win = op.get(props, 'iWindow', window);

        win.addEventListener('mouseover', show);

        return () => {
            const { timer } = state;
            if (timer) {
                clearTimeout(timer);
            }
            win.removeEventListener('mouseover', show);
        };
    });

    useLayoutEffect(() => {
        const doc = op.get(props, 'iDocument', document);
        if (!bodyRef.current && typeof doc !== 'undefined') {
            bodyRef.current = doc.body;
        }
    }, [bodyRef.current]);

    // Renderers
    const render = () => {
        if (!bodyRef.current) {
            return null;
        }

        const {
            align = ENUMS.ALIGN.CENTER,
            children,
            className,
            namespace,
            verticalAlign = ENUMS.VERTICAL_ALIGN.CENTER,
            visible = false,
        } = state;

        const cname = cn({
            [className]: !!className,
            [namespace]: !!namespace,
            [align]: !!align,
            [verticalAlign]: !!verticalAlign,
            visible,
        });

        return ReactDOM.createPortal(
            <div ref={containerRef} className={cname}>
                <div className='container'>{children}</div>
            </div>,
            bodyRef.current,
        );
    };

    return render();
};

Tooltip = forwardRef(Tooltip);

Tooltip.ENUMS = ENUMS;

Tooltip.propTypes = {
    align: PropTypes.oneOf(Object.values(ENUMS.ALIGN)),
    autohide: PropTypes.number,
    autoshow: PropTypes.bool,
    className: PropTypes.string,
    namespace: PropTypes.string,
    onHide: PropTypes.func,
    onShow: PropTypes.func,
    verticalAlign: PropTypes.oneOf(Object.values(ENUMS.VERTICAL_ALIGN)),
    visible: PropTypes.bool,
};

Tooltip.defaultProps = {
    align: ENUMS.ALIGN.CENTER,
    autoshow: true,
    namespace: 'ar-tooltip',
    onHide: noop,
    onShow: noop,
    verticalAlign: ENUMS.VERTICAL_ALIGN.TOP,
    visible: false,
};

export { Tooltip, Tooltip as default };
