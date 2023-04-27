import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import Button from 'reactium-ui/Button';
import Icon from 'reactium-ui/Icon';
import { Scrollbars } from '@atomic-reactor/react-custom-scrollbars';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';

import ENUMS from './enums';

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
 * Hook Component: Dropdown
 * -----------------------------------------------------------------------------
 */
let Dropdown = (
    {
        children,
        iDocument,
        iWindow,
        menuRenderer,
        onBeforeCollapse,
        onBeforeExpand,
        onChange,
        onCollapse,
        onExpand,
        onItemClick,
        onItemSelect,
        onItemUnselect,
        ...props
    },
    ref,
) => {
    // Refs
    const containerRef = useRef();
    const menuRef = useRef();
    const stateRef = useRef({
        ...props,
        uuid: uuid(),
        init: false,
        tabIndex: -1,
    });

    // State
    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = (newState, caller) => {
        if (!containerRef.current) return;

        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        if (ENUMS.DEBUG && caller) {
            console.log('setState()', caller, {
                state: stateRef.current,
            });
        }

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    // Prefixed className
    const cname = cls =>
        _.compact([
            op.get(stateRef.current, 'namespace', 'ar-dropdown'),
            cls,
        ]).join('-');

    // Filtered data
    const filteredData = () => {
        let { data = [], filter, labelField, valueField } = stateRef.current;

        filter = filter ? String(filter).toLowerCase() : filter;

        return data.filter(item => {
            const label = String(op.get(item, labelField, '')).toLowerCase();
            const value = String(op.get(item, valueField, ''));
            return !filter || label.includes(filter) || value.includes(filter);
        });
    };

    const collapse = () => {
        let { animation, element, expanded } = stateRef.current;

        if (expanded !== true) return Promise.resolve();

        if (animation) return animation;

        const { animationEase, animationSpeed } = stateRef.current;

        const menu = menuRef.current;

        menu.style.height = 'auto';
        menu.style.display = 'block';
        menu.style.overflow = 'hidden';
        menu.classList.remove('expanded');

        onBeforeCollapse({
            type: ENUMS.EVENT.BEFORE_COLLAPSE,
            menu,
            target: handle,
            currentTarget: element,
        });

        animation = new Promise(resolve =>
            TweenMax.to(menu, animationSpeed, {
                ease: animationEase,
                height: 0,
                onComplete: () => {
                    menu.removeAttribute('style');

                    onCollapse({
                        type: ENUMS.EVENT.COLLAPSE,
                        menu,
                        target: handle,
                        currentTarget: element,
                    });

                    setState({ animation: null, expanded: false });

                    resolve();
                },
            }),
        );

        setState({ animation });

        return animation;
    };

    const expand = () => {
        let { animation, element, expanded } = stateRef.current;

        if (expanded === true) return Promise.resolve();

        if (animation) return animation;

        const { animationEase, animationSpeed } = stateRef.current;

        const menu = menuRef.current;

        menu.style.height = 'auto';
        menu.style.display = 'block';
        menu.style.overflow = 'hidden';
        menu.classList.remove('expanded');

        onBeforeExpand({
            type: ENUMS.EVENT.BEFORE_EXPAND,
            menu,
            target: handle,
            currentTarget: element,
        });

        animation = new Promise(resolve =>
            TweenMax.from(menu, animationSpeed, {
                ease: animationEase,
                height: 0,
                onComplete: () => {
                    menu.removeAttribute('style');

                    onExpand({
                        type: ENUMS.EVENT.EXPAND,
                        menu,
                        target: handle,
                        currentTarget: element,
                    });

                    setState({ animation: null, expanded: true });

                    resolve();
                },
            }),
        );

        setState({ animation });

        return animation;
    };

    const toggle = () => {
        const { expanded } = stateRef.current;
        return expanded === true ? collapse() : expand();
    };

    // Determin if an element is a child
    const isChild = child => {
        const { element, uuid } = stateRef.current;
        const { instance } = child.dataset;
        return uuid === instance || element === child;
    };

    const dismiss = e => {
        const { animation, expanded } = stateRef.current;

        if (!expanded) return animation ? animation : Promise.resolve();

        if (!isChild(e.target)) {
            e.stopImmediatePropagation();
            return collapse();
        }

        return animation ? animation : Promise.resolve();
    };

    const _onChange = () => {
        const { init, event, selection = [] } = stateRef.current;
        if (!init) return;
        onChange({ ...event, type: ENUMS.EVENT.CHANGE });
        setState({ event: null });
    };

    const _onItemClick = async (e, val) => {
        let action;
        let {
            data,
            iconField,
            labelField,
            multiSelect,
            selection = [],
            valueField,
        } = stateRef.current;
        let sel = _.uniq(Array.from(selection));
        sel = multiSelect === true ? sel : [];

        if (sel.includes(val)) {
            action = ENUMS.EVENT.ITEM_UNSELECT;
            sel = _.without(sel, val);
        } else {
            action = ENUMS.EVENT.ITEM_SELECT;
            sel.push(val);
        }

        sel = _.uniq(sel);

        const dataSelected = data.filter(item =>
            sel.includes(item[valueField]),
        );
        const index = _.findIndex(data, { [valueField]: val });
        const labels = _.compact(_.pluck(dataSelected, labelField));
        const icons = _.compact(_.pluck(dataSelected, iconField));

        const evt = {
            icons,
            index,
            item: data[index],
            labels,
            selection: sel,
            type: action,
        };

        const complete = () => {
            onItemClick({ ...evt, type: ENUMS.EVENT.ITEM_CLICK });
            if (action === ENUMS.EVENT.ITEM_SELECT) onItemSelect(evt);
            if (action === ENUMS.EVENT.ITEM_UNSELECT) onItemUnselect(evt);
            setState({ selection: sel, event: evt });
        };

        if (!multiSelect) {
            collapse().then(() => complete());
        } else {
            //e.target.blur();
            complete();
        }
    };

    const _onKey = e => {
        const { element } = stateRef.current;
        const child = isChild(e.target);

        if (!child) return;

        switch (e.keyCode) {
            case 27:
                e.preventDefault();
                collapse();
                break;

            case 38:
            case 40:
                e.preventDefault();
                const inc = e.keyCode === 38 ? -1 : 1;
                nav(inc);
                break;

            default:
                if (isChild(e.target)) {
                    expand();
                }
        }

        e.stopImmediatePropagation();
    };

    const nav = async inc => {
        await expand();

        const data = filteredData();

        let { element, tabIndex } = stateRef.current;

        tabIndex += inc;
        tabIndex = tabIndex < -1 ? data.length - 1 : tabIndex;
        tabIndex = tabIndex >= data.length ? -1 : tabIndex;

        if (tabIndex === -1) element.focus();

        setState({ tabIndex });
    };

    const handle = () => ({
        children,
        onBeforeCollapse,
        onBeforeExpand,
        onChange,
        onCollapse,
        onExpand,
        onItemClick,
        onItemSelect,
        onItemUnselect,
        props,
        setState,
        state,
    });

    // Side Effects
    useEffect(() => {
        const { data = [] } = props;
        setState({ data });
    }, [props.data]);

    useEffect(() => {
        const newState = {};
        if (props.align !== op.get(state, 'align')) {
            newState['align'] = props.align;
        }
        if (props.verticalAlign !== op.get(state, 'verticalAlign')) {
            newState['verticalAlign'] = props.verticalAlign;
        }

        if (Object.keys(newState).length > 0) setState(newState);
    }, [props.align, props.verticalAlign]);

    useEffect(() => {
        const { filter = [] } = props;
        setState({ filter });
    }, [props.filter]);

    useEffect(() => {
        _onChange();
    }, [stateRef.current.selection]);

    useEffect(() => {
        const { init } = stateRef.current;
        if (init) return;

        // window events
        const win = iWindow ? iWindow : window;
        const doc = iDocument ? iDocument : document;

        if (doc && win) {
            doc.addEventListener(ENUMS.TOGGLE.MOUSE_DOWN, e => dismiss(e));
            win.addEventListener(ENUMS.TOGGLE.KEY_DOWN, e => _onKey(e));
        }

        return () => {
            doc.removeEventListener(ENUMS.TOGGLE.MOUSE_DOWN, e => dismiss(e));
            win.removeEventListener(ENUMS.TOGGLE.KEY_DOWN, e => _onKey(e));
        };
    }, [stateRef.current.init]);

    useEffect(() => {
        let {
            collapseEvent,
            expandEvent,
            init,
            multiSelect,
            selector,
            toggleEvent,
        } = stateRef.current;

        if (init) return;

        const elm = containerRef.current.querySelector(selector);

        if (collapseEvent || expandEvent) {
            const collapseEvents = Array.isArray(collapseEvent)
                ? collapseEvent
                : [collapseEvent];

            const expandEvents = Array.isArray(expandEvent)
                ? expandEvent
                : [expandEvent];

            _.chain(collapseEvents)
                .uniq()
                .compact()
                .value()
                .forEach(evt => {
                    elm.addEventListener(evt, e => {
                        if (multiSelect) return;
                        collapse(e);
                    });
                });

            _.chain(expandEvents)
                .uniq()
                .compact()
                .value()
                .forEach(evt => {
                    elm.addEventListener(evt, e => expand(e));
                });
        } else {
            const toggleEvents = Array.isArray(toggleEvent)
                ? toggleEvent
                : [toggleEvent];

            _.chain(toggleEvents)
                .uniq()
                .compact()
                .value()
                .forEach(evt => {
                    elm.addEventListener(evt, e => toggle(e));
                });
        }

        setState({ init: true, element: elm });
    }, [stateRef.current.init]);

    useLayoutEffect(() => {
        const { element, tabIndex } = stateRef.current;
        if (tabIndex < 0) return;

        const selector = `[data-index='${tabIndex}']`;
        const elm = containerRef.current.querySelector(selector);
        if (elm) elm.focus();
    }, [stateRef.current.tabIndex]);

    // External Interface
    useImperativeHandle(ref, handle);

    // Renderers
    const renderMenuItems = () => {
        const {
            checkbox,
            color,
            uuid: id,
            iconField,
            labelField,
            labelType,
            maxHeight,
            minHeight,
            selection = [],
            size,
            tabIndex,
            valueField,
        } = stateRef.current;

        const data = filteredData();

        return (
            <Scrollbars
                autoHeight
                autoHeightMin={minHeight}
                autoHeightMax={maxHeight}
                thumbMinSize={5}>
                {menuRenderer ? (
                    menuRenderer(data, handle)
                ) : (
                    <ul data-instance={id}>
                        {data.map((item, i) => {
                            let Ico = null;
                            const val = op.get(item, valueField);
                            const label = op.get(item, labelField);
                            const key = `ar-dropdown-item-${id}-${i}`;
                            const active = selection.includes(val);
                            const className = cn({ active });

                            if (iconField) {
                                const icon = op.get(item, iconField);
                                if (icon) {
                                    Ico = op.get(Icon, icon);
                                }
                            }

                            return (
                                <li
                                    key={key}
                                    className={className}
                                    data-instance={id}>
                                    <Button
                                        color={color}
                                        active={active}
                                        type={labelType}
                                        data-index={i}
                                        data-instance={id}
                                        size={size}
                                        onFocus={() =>
                                            setState({ tabIndex: i })
                                        }
                                        onClick={e => _onItemClick(e, val)}>
                                        {checkbox && (
                                            <span className='checkbox'>
                                                <Icon name='Feather.Check' />
                                            </span>
                                        )}
                                        {Ico && (
                                            <span className='mr-xs-8'>
                                                <Ico width={18} height={18} />
                                            </span>
                                        )}
                                        {label || val}
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Scrollbars>
        );
    };

    const render = () => {
        const {
            align,
            className,
            namespace,
            expanded,
            verticalAlign,
        } = stateRef.current;

        const contClassName = cn({
            [namespace]: !!namespace,
            [className]: !!className,
            expanded,
        });

        const menuClassName = cn({
            expanded,
            [cname('menu')]: true,
            [cname(`menu-align-${align}`)]: true,
            [cname(`menu-vertical-align-${verticalAlign}`)]: true,
        });

        return (
            <div ref={containerRef} className={contClassName}>
                {children}
                <div ref={menuRef} className={menuClassName}>
                    {renderMenuItems()}
                </div>
            </div>
        );
    };

    return render();
};

Dropdown = forwardRef(Dropdown);

Dropdown.ENUMS = ENUMS;

Dropdown.propTypes = {
    align: PropTypes.oneOf(Object.values(ENUMS.ALIGN)),
    animationEase: PropTypes.object,
    animationSpeed: PropTypes.number,
    className: PropTypes.string,
    checkbox: PropTypes.bool,
    collapseEvent: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.oneOf(Object.values(ENUMS.TOGGLE)),
    ]),
    color: PropTypes.oneOf(Object.values(Button.ENUMS.COLOR)),
    data: PropTypes.array,
    dismissable: PropTypes.bool,
    expanded: PropTypes.bool,
    expandEvent: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.oneOf(Object.values(ENUMS.TOGGLE)),
    ]),
    filter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    iconField: PropTypes.string,
    labelField: PropTypes.string,
    labelType: PropTypes.oneOf(Object.values(Button.ENUMS.TYPE)),
    menuRenderer: PropTypes.func,
    multiSelect: PropTypes.bool,
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    namespace: PropTypes.string,
    selection: PropTypes.array,
    selector: PropTypes.string,
    size: PropTypes.oneOf(Object.values(Button.ENUMS.SIZE)),
    toggleEvent: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.oneOf(Object.values(ENUMS.TOGGLE)),
    ]),
    onBeforeCollapse: PropTypes.func,
    onBeforeExpand: PropTypes.func,
    onChange: PropTypes.func,
    onCollapse: PropTypes.func,
    onExpand: PropTypes.func,
    onItemClick: PropTypes.func,
    onItemSelect: PropTypes.func,
    onItemUnselect: PropTypes.func,
    valueField: PropTypes.string,
    verticalAlign: PropTypes.oneOf(Object.values(ENUMS.VALIGN)),
};

Dropdown.defaultProps = {
    align: ENUMS.ALIGN.CENTER,
    animationEase: Power2.easeInOut,
    animationSpeed: 0.25,
    checkbox: false,
    collapseEvent: null,
    color: Button.ENUMS.COLOR.CLEAR,
    data: [],
    dismissable: true,
    expanded: false,
    expandEvent: null,
    filter: null,
    iconField: 'icon',
    labelField: 'label',
    labelType: Button.ENUMS.TYPE.BUTTON,
    name: uuid(),
    maxHeight: 167,
    menuRenderer: null,
    minHeight: 0,
    multiSelect: false,
    namespace: 'ar-dropdown',
    selection: [],
    selector: '[data-dropdown-element]',
    size: Button.ENUMS.SIZE.SM,
    toggleEvent: ENUMS.TOGGLE.CLICK,
    onBeforeCollapse: noop,
    onBeforeExpand: noop,
    onChange: noop,
    onCollapse: noop,
    onExpand: noop,
    onItemClick: noop,
    onItemSelect: noop,
    onItemUnselect: noop,
    valueField: 'value',
    verticalAlign: ENUMS.VALIGN.BOTTOM,
};

export { Dropdown, Dropdown as default };
