import _ from 'underscore';
import op from 'object-path';
import { useSlate } from 'slate-react';
import Portal from 'components/common-ui/Portal';
import Reactium, { useDerivedState } from 'reactium-core/sdk';
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
            const { id, button: Button, sidebar } = item;
            if (Button && sidebar) {
                return (
                    <Button
                        data-container={container}
                        data-sidebar={id}
                        editor={editor}
                        key={`ar-rte-sidebar-btn-${id}`}
                        onMouseDown={e => e.preventDefault()}
                    />
                );
            }
        })}
    </div>
);

const Sidebar = ({ className, container: parent, id, nodes, style }) => {
    const editor = useSlate();

    const containerRef = useRef();

    const collapsibleRef = useRef();

    if (typeof window === 'undefined') return null;

    const { range, rect, selected, selection } = useSelected();

    const [state, setState] = useDerivedState({});

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

        if (height === 0 || top === 0) return { display: 'none', opacity: 0 };

        const left = parentRect.left - 50;
        top = Math.max(top, parentRect.top) + height - 23;

        return { left, top, display: 'block', opacity: 1 };
    };

    const toggle = () => {
        collapsibleRef.current.toggle();
    };

    const render = useMemo(() => {
        const _style = {
            ...style,
            ...getPosition(),
        };

        return (
            <Portal>
                <div style={_style} ref={containerRef} className={className}>
                    <Button
                        appearance='circle'
                        color='primary'
                        onClick={toggle}
                        style={{ width: 30, height: 30, padding: 0 }}>
                        <Icon name='Feather.Plus' size={20} />
                    </Button>
                    <Collapsible
                        className={cx('buttons')}
                        expanded={false}
                        ref={collapsibleRef}>
                        <Buttons
                            container={id}
                            editor={editor}
                            nodes={nodes()}
                        />
                    </Collapsible>
                </div>
            </Portal>
        );
    });

    return render;
};

Sidebar.defaultProps = {
    style: {},
};

export { Sidebar as default };

// <Buttons container={id} editor={editor} nodes={nodes()} />
