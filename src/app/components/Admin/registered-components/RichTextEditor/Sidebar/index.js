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
            const { id, button: Element } = item;
            if (Element) {
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

let Sidebar = ({ className, container: parent, id, nodes, style }, ref) => {
    const editor = useSlate();

    const containerRef = useRef();

    const collapsibleRef = useRef();

    if (typeof window === 'undefined') return null;

    const { range, rect, selected, selection } = useSelected();

    const [state, setState] = useDerivedState({
        collapsed: false,
    });

    const cx = cls => [className, cls].join('-');

    const getPosition = () => {
        const element = containerRef.current;
        const hidden = !editor.selection;

        if (!element || !rect || !parent || hidden || selected)
            return { display: 'none', opacity: 0 };

        element.style.display = 'block';
        element.classList.remove('invert');
        element.classList.remove('no-arrow');

        const parentRect = parent.getBoundingClientRect();

        let { height, top } = rect;

        if (height === 0 || top === 0) return { display: 'none', opacity: 0 };

        const left = parentRect.left - 50;
        top = Math.max(top, parentRect.top) + height - 23;

        return { left, top, display: 'block', opacity: 1 };
    };

    const toggle = () => {
        setState({ collapsed: !collapsibleRef.current.state.expanded });

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

        const nodes = _.where(Object.values(Reactium.RTE.buttons), {
            sidebar: true,
        });

        return (
            <Portal>
                <div style={_style} ref={containerRef} className={className}>
                    <Button
                        appearance='circle'
                        className={cn({ collapsed })}
                        color='primary'
                        onClick={toggle}
                        style={{ width: 30, height: 30, padding: 0 }}>
                        <Icon name='Feather.Plus' size={20} />
                    </Button>
                    <Collapsible
                        className={cx('buttons')}
                        expanded={false}
                        ref={collapsibleRef}>
                        <Buttons container={id} editor={editor} nodes={nodes} />
                    </Collapsible>
                </div>
            </Portal>
        );
    });

    return render;
};

Sidebar = forwardRef(Sidebar);

Sidebar.defaultProps = {
    style: {},
};

export { Sidebar as default };

// <Buttons container={id} editor={editor} nodes={nodes()} />
