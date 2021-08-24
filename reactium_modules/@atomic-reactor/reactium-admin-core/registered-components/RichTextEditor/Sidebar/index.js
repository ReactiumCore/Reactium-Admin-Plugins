import _ from 'underscore';
import cn from 'classnames';
import { useSlate } from 'slate-react';
import { useSelected } from '../_utils';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';

import {
    useDerivedState,
    useEventHandle,
    useHookComponent,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

const Buttons = ({ container, editor, nodes }) => (
    <div className='btn-group'>
        {nodes.map(item => {
            const { id, button: Element, sidebar } = item;
            if (Element && sidebar === true) {
                return (
                    <Element
                        data-container={container}
                        data-sidebar
                        editor={editor}
                        key={`ar-rte-sidebar-btn-${id}`}
                        onMouseDown={e => e.preventDefault()}
                    />
                );
            }
        })}
    </div>
);

let Sidebar = (
    { className, container: parent, id, minX, minY, style },
    ref,
) => {
    const editor = useSlate();

    const { buttons } = editor;

    const buttonRef = useRef();
    const containerRef = useRef();

    if (typeof window === 'undefined') return null;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const { rect } = useSelected();

    const [state, setState] = useDerivedState({
        collapsed: true,
        position: { display: 'none', opacity: 0 },
    });

    const cx = cls => [className, cls].join('-');

    const getPosition = () => {
        const element = containerRef.current;
        const hidden = !editor.selection;

        if (!element || !rect || !parent || hidden) return state.position;

        element.style.display = 'block';
        element.classList.remove('invert');
        element.classList.remove('no-arrow');

        const parentRect = parent.getBoundingClientRect();

        let { height, top } = rect;

        top -= parentRect.top;

        if (height > 30) {
            const diff = height - 30;
            top += Math.floor(diff / 2);
        } else {
            top -= 7;
        }

        top = Math.floor(top);
        top = Math.max(-7, top);

        let left = -50;

        top = Math.max(minY, top);
        left = Math.max(minX, left);

        const position = { left, top, display: 'block', opacity: 1 };

        return position;
    };

    const toggle = () => {
        const { collapsed } = state;
        return collapsed ? expand() : collapse();
    };

    const collapse = () => {
        if (state.animiation) return state.animation;

        const animation = new Promise(resolve => {
            const { collapsed } = state;
            if (!collapsed) resolve();

            const cont = buttonRef.current;

            TweenMax.to(cont, 0.5, {
                opacity: 0,
                ease: Power2.easeInOut,
                onComplete: () => {
                    cont.removeAttribute('style');
                    state.collapsed = true;
                    setState({
                        animation: null,
                        collapsing: null,
                        collapsed: true,
                    });
                    resolve();
                },
            });
        });

        setState({ animation, expanding: null, collapsing: true });

        return animation;
    };

    const expand = () => {
        if (state.animiation) return state.animation;

        const animation = new Promise(resolve => {
            const { collapsed } = state;
            if (!collapsed) resolve();

            const cont = buttonRef.current;
            cont.style.opacity = 1;
            cont.style.display = 'block';

            TweenMax.from(cont, 0.5, {
                opacity: 0,
                ease: Power2.easeInOut,
                onComplete: () => {
                    cont.removeAttribute('style');
                    state.collapsed = true;
                    setState({
                        animation: null,
                        expanding: null,
                        collapsed: false,
                    });
                    resolve();
                },
            });
        });

        setState({ animation, expanding: true, collapsing: null });

        return animation;
    };

    const _handle = () => ({
        container: containerRef,
        position: getPosition,
        setState,
        state,
        toggle,
    });

    const [handle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        const position = getPosition();
        if (!_.isEqual(position, state.position)) setState({ position });
    }, [state.position]);

    const render = () => {
        const { collapsing, collapsed, expanding } = state;
        const _style = { ...style, ...getPosition() };
        const nodes = buttons ? Object.values(buttons) : [];
        const cls = cn({ collapsed: (collapsed || collapsing) && !expanding });

        return (
            <div style={_style} ref={containerRef} className={className}>
                <Button
                    appearance='circle'
                    className={cls}
                    color='primary'
                    onClick={toggle}
                    style={{ width: 30, height: 30, padding: 0 }}>
                    <Icon name='Feather.X' size={20} />
                </Button>
                <div
                    ref={buttonRef}
                    className={cx('buttons')}
                    style={{ display: state.collapsed ? 'none' : null }}>
                    <Buttons container={id} editor={editor} nodes={nodes} />
                </div>
            </div>
        );
    };

    return render();
};

Sidebar = forwardRef(Sidebar);

Sidebar.defaultProps = {
    minX: -50,
    minY: 35,
    style: {},
};

export { Sidebar as default };

/*
<Collapsible
    direction='horizontal'
    expanded={!collapsed}
    onExpand={() => setState({ collapsed: false })}
    onCollapse={() => setState({ collapsed: true })}
    ref={collapsibleRef}>

    <Buttons container={id} editor={editor} nodes={nodes} />
</Collapsible>

{!state.collapsed && (
    <Buttons
        className={cx('buttons')}
        container={id}
        editor={editor}
        nodes={nodes}
    />
)}
*/
