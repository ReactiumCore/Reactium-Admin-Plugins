import _ from 'underscore';
import cn from 'classnames';
import cc from 'camelcase';
import { Scrollbars } from 'react-custom-scrollbars';
import { Button, Icon, Collapsible } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
} from 'react';

import Reactium, {
    useEventEffect,
    useIsContainer,
    useRegisterSyncHandle,
    useWindowSize,
    Zone,
} from 'reactium-core/sdk';

let Sidebar = ({ children, editor }, ref) => {
    const collapsibleRef = useRef();
    const containerRef = useRef();
    const prefKey = 'contentSidebarExpanded';

    const { cx, type } = editor;

    const className = cx('sidebar');

    const { breakpoint } = useWindowSize();

    const state = useRegisterSyncHandle(cc(`content-editor-sidebar-${type}`), {
        breaks: ['md', 'lg', 'xl'],
        breakpoint,
        expanded: Reactium.Prefs.get(prefKey, false),
        icon: 'Feather.ChevronLeft',
    });

    const setBreakpoint = value => {
        state.set('breakpoint', _.isString(value) ? value : breakpoint);
    };

    const setExpanded = value => {
        state.set('expanded', value);
        Reactium.Prefs.set(prefKey, value);
    };

    const setIcon = value => {
        const ico = _.isString(value)
            ? value
            : state.get('expanded') === true
            ? 'Feather.ChevronRight'
            : 'Feather.ChevronLeft';

        state.set('icon', ico);
    };

    const isContainer = useIsContainer();

    const zoneToolbarTypeID = cx(`${type}-toolbar`)
        .split(' ')
        .shift();

    const zoneToolbarID = cx('toolbar')
        .split(' ')
        .shift();

    const dismiss = e => {
        const { breaks = [], expanded, breakpoint } = state.get();
        if (breaks.includes(breakpoint)) return;
        if (!containerRef.current || !expanded) return;
        if (isContainer(e.target, containerRef.current)) return;
        collapsibleRef.current.collapse();
    };

    const collapse = () =>
        collapsibleRef.current && collapsibleRef.current.collapse();

    const expand = () =>
        collapsibleRef.current && collapsibleRef.current.expand();

    const toggle = () =>
        collapsibleRef.current && collapsibleRef.current.toggle();

    const _onCollapse = () => collapsibleRef.current && setExpanded(false);

    const _onExpand = () => collapsibleRef.current && setExpanded(true);

    const _onHotkey = e => {
        if (!containerRef.current) return;
        e.preventDefault();
        if (collapsibleRef.current) toggle();
        containerRef.current.focus();
    };

    state.extend('collapse', collapse);
    state.extend('dismiss', dismiss);
    state.extend('expand', expand);
    state.extend('setExpanded', setExpanded);
    state.extend('setIcon', setIcon);
    state.extend('setBreakpoint', setBreakpoint);
    state.extend('toggle', toggle);

    useImperativeHandle(ref, () => state);

    useEffect(() => {
        if (!collapsibleRef.current) return;
        Reactium.Hotkeys.register('content-sidebar-toggle', {
            callback: _onHotkey,
            key: 'mod+\\',
            order: Reactium.Enums.priority.lowest,
            scope: document,
        });

        return () => {
            Reactium.Hotkeys.unregister('content-sidebar-toggle');
        };
    }, [collapsibleRef.current]);

    useEffect(setBreakpoint, [breakpoint]);

    useEffect(setIcon, [state.get('expanded')]);

    useEventEffect(window, {
        mousedown: dismiss,
        touchstart: dismiss,
    });

    return (
        <div
            tabIndex={0}
            className={cn(className, { expanded: state.get('expanded') })}
            ref={containerRef}>
            <div className={cx('toolbar')}>
                <Scrollbars>
                    <div className={cx('toolbar-scroll')}>
                        <div className={cx('toolbar-top')}>
                            <Zone
                                zone={`${zoneToolbarID}-top`}
                                editor={editor}
                            />
                            <Zone
                                zone={`${zoneToolbarTypeID}-top`}
                                editor={editor}
                            />
                        </div>
                        <div className={cx('toolbar-bottom')}>
                            <Zone
                                zone={`${zoneToolbarID}-bottom`}
                                editor={editor}
                            />
                            <Zone
                                zone={`${zoneToolbarTypeID}-bottom`}
                                editor={editor}
                            />
                        </div>
                    </div>
                </Scrollbars>
                <div className={cx('sidebar-toggle')}>
                    <Button color='clear' onClick={toggle}>
                        <Icon name={state.get('icon')} size={20} />
                    </Button>
                    <div className='bg' />
                </div>
            </div>
            <Collapsible
                className={cx('collapsible')}
                direction='horizontal'
                expanded={state.get('expanded')}
                onCollapse={_onCollapse}
                onExpand={_onExpand}
                ref={collapsibleRef}>
                <Scrollbars autoHeight autoHeightMin='calc(100vh - 60px)'>
                    {children}
                </Scrollbars>
            </Collapsible>
        </div>
    );
};

Sidebar = forwardRef(Sidebar);

export default Sidebar;
