import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';
import op from 'object-path';
import PropTypes from 'prop-types';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';

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
 * Hook Component: Scene
 * -----------------------------------------------------------------------------
 */
let Scene = (props, ref) => {
    // Refs
    const containerRef = useRef();
    const historyRef = useRef([]);
    const panelRef = useRef({});
    const prevStateRef = useRef({});
    const stateRef = useRef({
        ...props,
        animating: false,
        init: false,
        staged: null,
    });

    // State
    const [state, setNewState] = useState(stateRef.current);
    const [prevState, setPrevState] = useState(prevStateRef.current);
    const [history, setHistory] = useState(historyRef.current);

    // Internal Interface
    const setState = (newState, caller) => {
        // Get the previous state
        const prvState = { ...stateRef.current };

        // Update prevStateRef
        prevStateRef.current = { ...prvState };

        // Update the stateRef
        stateRef.current = {
            ...prvState,
            ...newState,
        };

        if (ENUMS.DEBUG === true && caller) {
            console.log(caller, {
                prev: prevStateRef.current,
                curr: stateRef.current,
            });
        }

        // Trigger useEffect()
        setPrevState(prevStateRef.current);
        setNewState(stateRef.current);
    };

    const setPanelRef = (elm, key) => {
        panelRef.current[key] = elm;
    };

    const addChildren = childs => {
        childs = Array.isArray(childs) ? childs : [childs];

        if (childs.length < 1) {
            return;
        }

        const { panels = {} } = stateRef.current;

        React.Children.forEach(childs, (child, i) => {
            const { props: childProps = {} } = child;
            const id = op.has(childProps, 'id') ? childProps.id : i;
            panels[String(id)] = child;
        });

        setState({ panels }, 'addChildren()');
    };

    const removeChildren = childs => {
        childs = Array.isArray(childs) ? childs : [childs];

        if (childs.length < 1) {
            return;
        }

        childs.sort();
        childs.reverse();

        const { panels = {} } = stateRef.current;

        React.Children.forEach(childs, (child, i) => {
            const { props: childProps = {} } = child;
            const id = op.has(childProps, 'id') ? childProps.id : i;
            op.del(panels, String(id));
        });

        setState({ panels }, 'removeChildren()');
    };

    const ns = suffix => {
        const { namespace } = stateRef.current;
        return `${namespace}-${suffix}`;
    };

    const updateHistory = params => {
        const { active } = stateRef.current;
        let {
            animation = ENUMS.ANIMATION.SLIDE,
            direction = ENUMS.DIRECTION.LEFT,
            panel,
        } = params;

        direction = ENUMS.OPPOSITE[direction];
        animation = ENUMS.OPPOSITE[animation];
        panel = active;

        historyRef.current.push({ ...params, panel, animation, direction });
        setHistory(historyRef.current);
    };

    const clear = () => {
        historyRef.current = [];
        setHistory(historyRef.current);
    };

    const back = () => {
        const hist = Array.from(historyRef.current);

        if (hist.length < 1) {
            return;
        }

        const last = hist.pop();

        const anime = navTo(last, true);

        historyRef.current = hist;
        setHistory(historyRef.current);

        return anime;
    };

    const navTo = (params = {}, noHistory, clearHistory) => {
        if (typeof params === 'string' || typeof params === 'number') {
            params = {
                panel: params,
            };
        }

        params = {
            animation: stateRef.current.animation || ENUMS.ANIMATION.SLIDE,
            direction: stateRef.current.direction || ENUMS.DIRECTION.LEFT,
            animationSpeed: stateRef.current.animationSpeed || ENUMS.DURATION,
            ...params,
        };

        const { animation, animationSpeed, panel } = params;
        const { active, animating, onBeforeChange, tween } = stateRef.current;

        if (!noHistory && !clearHistory) {
            updateHistory(params);
        }

        if (clearHistory === true) {
            clear();
        }

        if (String(active) === String(panel) || animating === true) {
            return tween;
        }

        onBeforeChange({
            type: ENUMS.EVENT.BEFORE_CHANGE,
            active,
            staged: panel,
        });

        // hide all panels
        Object.values(panelRef.current).forEach(panel =>
            TweenMax.set(panel, { display: 'none' }),
        );

        if (animationSpeed === 0 || !active) {
            setState({ active: panel }, 'navTo()');
            return Promise.resolve(stateRef.current);
        }

        stateRef.current.animating = true;
        let anime;

        switch (animation) {
            case ENUMS.ANIMATION.COVER:
                anime = cover(params);
                break;

            case ENUMS.ANIMATION.FADE:
                anime = fade(params);
                break;

            case ENUMS.ANIMATION.FLIP:
                anime = flip(params);
                break;

            case ENUMS.ANIMATION.REVEAL:
                anime = reveal(params);
                break;

            case ENUMS.ANIMATION.SLIDE:
            default:
                anime = Promise.all([slideIN(params), slideOUT(params)]);
                break;
        }

        stateRef.current.tween = anime;

        return anime.then(() => {
            setState(
                { active: panel, animating: false, tween: null },
                'navTo()',
            );
            return stateRef.current;
        });
    };

    const cover = params => {
        const { active } = stateRef.current;
        const prev = panelRef.current[String(active)];

        TweenMax.set(prev, {
            display: 'block',
            zIndex: 5,
            left: 0,
            top: 0,
        });

        return slideIN(params);
    };

    const fade = params => {
        const { direction = ENUMS.DIRECTION.IN } = params;

        switch (direction) {
            case ENUMS.DIRECTION.OUT:
                return fadeOut(params);

            case ENUMS.DIRECTION.IN:
            default:
                return fadeIn(params);
        }
    };

    const fadeIn = params =>
        new Promise(resolve => {
            const { active } = stateRef.current;
            const { animationSpeed = ENUMS.DURATION, panel } = params;

            const front = panelRef.current[String(panel)];

            TweenMax.set(front, {
                display: 'block',
                zIndex: 20,
                left: 0,
                top: 0,
                opacity: 1,
            });

            const back = panelRef.current[String(active)];

            TweenMax.set(back, {
                display: 'block',
                zIndex: 10,
                left: 0,
                top: 0,
                opacity: 1,
            });

            TweenMax.from(front, animationSpeed, {
                opacity: 0,
                ease: Power2.easeInOut,
                onComplete: () => {
                    TweenMax.set(back, { display: 'none' });
                    resolve();
                },
            });
        });

    const fadeOut = params =>
        new Promise(resolve => {
            const { active } = stateRef.current;
            const { animationSpeed = ENUMS.DURATION, panel } = params;

            const back = panelRef.current[String(panel)];

            TweenMax.set(back, {
                display: 'block',
                zIndex: 10,
                left: 0,
                top: 0,
                opacity: 1,
            });

            const front = panelRef.current[String(active)];

            TweenMax.set(front, {
                display: 'block',
                zIndex: 20,
                left: 0,
                top: 0,
                opacity: 1,
            });

            TweenMax.to(front, animationSpeed, {
                opacity: 0,
                ease: Power2.easeInOut,
                onComplete: () => {
                    TweenMax.set(front, { display: 'none', opacity: 1 });
                    resolve();
                },
            });
        });

    const flip = params => {
        const { active } = stateRef.current;

        const {
            direction = ENUMS.DIRECTION.LEFT,
            animationSpeed = ENUMS.DURATION,
            panel,
        } = params;

        const vertical = [ENUMS.DIRECTION.UP, ENUMS.DIRECTION.DOWN].includes(
            direction,
        );
        const negative = [ENUMS.DIRECTION.UP, ENUMS.DIRECTION.LEFT].includes(
            direction,
        );
        const prop = vertical ? 'rotationX' : 'rotationY';
        const rotation = negative ? -180 : 180;

        return Promise.all([
            new Promise(resolve => {
                const back = panelRef.current[String(panel)];
                TweenMax.set(back, {
                    zIndex: 10,
                    display: 'block',
                    left: 0,
                    top: 0,
                    backfaceVisibility: 'visible',
                });
                TweenMax.from(back, animationSpeed, {
                    [prop]: rotation,
                    ease: Power2.easeInOut,
                    onComplete: () => {
                        TweenMax.set(back, { zIndex: 20 });
                        resolve();
                    },
                });
            }),
            new Promise(resolve => {
                const front = panelRef.current[String(active)];
                TweenMax.set(front, {
                    zIndex: 20,
                    left: 0,
                    top: 0,
                    backfaceVisibility: 'hidden',
                });
                TweenMax.to(front, animationSpeed, {
                    [prop]: rotation,
                    ease: Power2.easeInOut,
                    onComplete: () => {
                        TweenMax.set(front, { display: 'none', [prop]: 0 });
                        resolve();
                    },
                });
            }),
        ]);
    };

    const reveal = params => {
        const { panel } = params;
        const curr = panelRef.current[String(panel)];

        TweenMax.set(curr, {
            display: 'block',
            zIndex: 5,
            left: 0,
            top: 0,
        });

        return slideOUT(params);
    };

    const slideIN = params =>
        new Promise(resolve => {
            const {
                direction = ENUMS.DIRECTION.LEFT,
                animationSpeed = ENUMS.DURATION,
                panel,
            } = params;

            const elm = panelRef.current[String(panel)];
            const cont = containerRef.current;

            let x = 0,
                y = 0;

            switch (direction) {
                case ENUMS.DIRECTION.UP:
                    y = cont.offsetHeight;
                    break;

                case ENUMS.DIRECTION.DOWN:
                    y = -cont.offsetHeight;
                    break;

                case ENUMS.DIRECTION.RIGHT:
                    x = -cont.offsetWidth;
                    break;

                case ENUMS.DIRECTION.LEFT:
                default:
                    x = cont.offsetWidth;
                    break;
            }

            TweenMax.set(elm, {
                display: 'block',
                zIndex: 20,
                left: 0,
                top: 0,
            });

            TweenMax.from(elm, animationSpeed, {
                left: x,
                top: y,
                ease: Power2.easeInOut,
                onComplete: () => resolve(),
            });
        });

    const slideOUT = params =>
        new Promise(resolve => {
            const {
                direction = ENUMS.DIRECTION.LEFT,
                animationSpeed = ENUMS.DURATION,
            } = params;

            const { active } = stateRef.current;
            const elm = panelRef.current[String(active)];
            const cont = containerRef.current;

            let x = 0,
                y = 0;

            switch (direction) {
                case ENUMS.DIRECTION.UP:
                    y = -cont.offsetHeight;
                    break;

                case ENUMS.DIRECTION.DOWN:
                    y = cont.offsetHeight;
                    break;

                case ENUMS.DIRECTION.RIGHT:
                    x = cont.offsetWidth;
                    break;

                case ENUMS.DIRECTION.LEFT:
                default:
                    x = -cont.offsetWidth;
                    break;
            }

            TweenMax.set(elm, {
                display: 'block',
                zIndex: 10,
            });

            TweenMax.to(elm, animationSpeed, {
                left: x,
                top: y,
                ease: Power2.easeInOut,
                onComplete: () => {
                    TweenMax.set(elm, { display: 'none' });
                    resolve();
                },
            });
        });

    const indexOf = panel =>
        Object.keys(stateRef.current.panels)
            .map(key => String(key))
            .indexOf(String(panel));

    const renderPanels = () => {
        const { active, panels, onRendered } = stateRef.current;

        return Object.keys(panels).map(key => {
            key = isNaN(key) ? key : String(key);

            return (
                <div
                    className={cn({
                        [ns('panel')]: true,
                        active: String(active) === key,
                    })}
                    key={ns(`panel-${key}`)}
                    ref={elm => setPanelRef(elm, key)}>
                    {panels[key]}
                </div>
            );
        });
    };

    const render = () => {
        let {
            className,
            height,
            namespace,
            style = {},
            width,
        } = stateRef.current;

        const cname = cn({
            [className]: !!className,
            [namespace]: !!namespace,
        });

        style = { ...style, height, width };

        return (
            <div ref={containerRef} className={cname} style={style}>
                <div className={ns('stage')}>{renderPanels()}</div>
            </div>
        );
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        active: () => {
            return stateRef.current.active;
        },
        addChildren,
        back,
        clearHistory: clear,
        history: {
            clear,
        },
        index: indexOf(stateRef.current.active),
        indexOf,
        navTo,
        removeChildren,
        setState,
        state: stateRef.current,
    }));

    // Side Effects
    useEffect(() => {
        setState(props, 'useEffect(props)');
    }, _.without(Object.values(props), props.onChange, props.onBeforeChange));

    useEffect(() => {
        const { active, children, init, panels = {} } = stateRef.current;

        if (React.Children.count(children) > 0) {
            stateRef.current.init = true;

            if (!active) {
                stateRef.current.active = Object.keys(panels)[0];
            }

            addChildren(children);
        }
    }, [props.children]);

    // onChange Handler
    useEffect(() => {
        const { active, init, onChange } = stateRef.current;
        const { active: previous } = prevStateRef.current;

        if (init === true && String(active) !== String(previous)) {
            onChange({ evt: ENUMS.EVENT.CHANGE, active, previous });
        }
    }, [stateRef.current.active]);

    return render();
};

Scene = forwardRef(Scene);

Scene.ENUMS = ENUMS;

Scene.propTypes = {
    active: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    animation: PropTypes.oneOf(Object.values(ENUMS.ANIMATION)),
    animationSpeed: PropTypes.number,
    className: PropTypes.string,
    direction: PropTypes.oneOf(Object.values(ENUMS.DIRECTION)),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    namespace: PropTypes.string,
    onBeforeChange: PropTypes.func,
    onChange: PropTypes.func,
    panels: PropTypes.object,
    style: PropTypes.object,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Scene.defaultProps = {
    animation: ENUMS.ANIMATION.SLIDE,
    animationSpeed: ENUMS.DURATION,
    direction: ENUMS.DIRECTION.LEFT,
    height: ENUMS.SIZE.HEIGHT,
    namespace: 'ar-scene',
    onBeforeChange: noop,
    onChange: noop,
    panels: {},
    style: {},
    width: ENUMS.SIZE.WIDTH,
};

export { Scene, Scene as default };
