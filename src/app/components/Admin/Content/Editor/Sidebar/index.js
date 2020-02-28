import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Scrollbars } from 'react-custom-scrollbars';
import React, {
    forwardRef,
    memo,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Button, Icon, Collapsible } from '@atomic-reactor/reactium-ui';

import Reactium, {
    useIsContainer,
    useRegisterHandle,
    Zone,
} from 'reactium-core/sdk';

let Sidebar = ({ children, editor, ...props }, ref) => {
    const collapsibleRef = useRef();
    const containerRef = useRef();

    const { cx, type } = editor;

    const [className, setClassName] = useState(cx('sidebar'));
    const [expanded, setExpanded] = useState(false);

    const isContainer = useIsContainer();

    const zoneToolbarID = cx(`${type}-toolbar`)
        .split(' ')
        .shift();

    const dismiss = e => {
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

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.addEventListener('mousedown', dismiss);
        window.addEventListener('touchstart', dismiss);

        return () => {
            window.removeEventListener('mousedown', dismiss);
            window.removeEventListener('touchstart', dismiss);
        };
    }, [containerRef.current, expanded]);

    useEffect(() => {
        handle.expanded = expanded;
    }, [expanded]);

    // handle
    const _handle = () => ({
        collapse,
        dismiss,
        expand,
        expanded,
        setExpanded,
        setHandle,
        toggle,
    });

    const [handle, setHandle] = useState(_handle());

    useImperativeHandle(ref, () => handle, [handle, expanded]);

    const render = () => {
        const icon = expanded ? 'Feather.ChevronRight' : 'Feather.ChevronLeft';
        return (
            <div className={cn(className, { expanded })} ref={containerRef}>
                <div className={cx('toolbar')}>
                    <Scrollbars autoHeight autoHeightMin='calc(100vh - 60px)'>
                        <div className={cx('toolbar-scroll')}>
                            <div className={cx('toolbar-top')}>
                                <Button
                                    color='clear'
                                    data-align='left'
                                    data-tooltip='Activity'
                                    data-vertical-align='middle'
                                    type='button'>
                                    <Icon name='Feather.Activity' />
                                </Button>
                                <Zone
                                    zone={`${zoneToolbarID}-top`}
                                    editor={editor}
                                />
                            </div>
                            <div className={cx('toolbar-bottom')}>
                                <Zone
                                    zone={`${zoneToolbarID}-bottom`}
                                    editor={editor}
                                />
                            </div>
                        </div>
                    </Scrollbars>
                    <div className={cx('sidebar-toggle')}>
                        <Button color='clear' onClick={toggle}>
                            <Icon name={icon} size={20} />
                        </Button>
                    </div>
                </div>
                <Collapsible
                    className={cx('collapsible')}
                    direction='horizontal'
                    expanded={expanded}
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

    return render();
};

Sidebar = forwardRef(Sidebar);

export default Sidebar;
