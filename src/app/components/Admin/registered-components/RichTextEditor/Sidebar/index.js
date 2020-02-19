import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { useSlate } from 'slate-react';
import Portal from 'components/common-ui/Portal';
import Reactium, { useDerivedState, useEventHandle } from 'reactium-core/sdk';
import { isMarkActive, toggleMark, useSelected } from '../_utils';
import { Button, Collapsible, Icon } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
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

let Sidebar = ({ className, container: parent, id, style }, ref) => {
    const editor = useSlate();

    const { buttons } = editor;

    const containerRef = useRef();

    const collapsibleRef = useRef();

    if (typeof window === 'undefined') return null;

    const { range, rect, selected, selection } = useSelected();

    const [state, setState] = useDerivedState({
        collapsed: true,
    });

    const cx = cls => [className, cls].join('-');

    const getPosition = () => {
        const element = containerRef.current;
        const hidden = !editor.selection;

        if (!element || !rect || !parent || hidden)
            return { display: 'none', opacity: 0 };

        element.style.display = 'block';
        element.classList.remove('invert');
        element.classList.remove('no-arrow');

        const parentRect = parent.getBoundingClientRect();

        let { height, top } = rect;

        top -= parentRect.top;

        if (height > 30) {
            const diff = height - 30;
            top += diff / 2;
        } else {
            top -= 7.5;
        }

        let left = -50;

        return { left, top, display: 'block', opacity: 1 };
    };

    const toggle = () => {
        const { collapsed } = state;
        setState({ collapsed: !collapsed });
        collapsibleRef.current.toggle();
    };

    const _handle = () => ({
        container: containerRef,
        position: getPosition,
        setState,
        state,
        toggle,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    const render = useMemo(() => {
        const { collapsed } = state;

        const _style = {
            ...style,
            ...getPosition(),
        };

        const nodes = buttons ? Object.values(buttons) : [];

        return (
            <div style={_style} ref={containerRef} className={className}>
                <Button
                    appearance='circle'
                    className={cn({ collapsed: !collapsed })}
                    color='primary'
                    onClick={toggle}
                    style={{ width: 30, height: 30, padding: 0 }}>
                    <Icon name='Feather.Plus' size={20} />
                </Button>
                <Collapsible
                    className={cx('buttons')}
                    expanded={!collapsed}
                    ref={collapsibleRef}>
                    <Buttons container={id} editor={editor} nodes={nodes} />
                </Collapsible>
            </div>
        );
    });

    return render;
};

Sidebar = forwardRef(Sidebar);

Sidebar.defaultProps = {
    style: {},
};

export { Sidebar as default };
