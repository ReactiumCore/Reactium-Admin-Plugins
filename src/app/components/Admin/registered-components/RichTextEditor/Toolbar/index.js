import _ from 'underscore';
import op from 'object-path';
import { useSlate } from 'slate-react';
import Portal from 'components/common-ui/Portal';
import Reactium, { useDerivedState } from 'reactium-core/sdk';
import { isMarkActive, toggleMark, useSelected } from '../_utils';

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
            const { id, button: Button, icon: Icon, toolbar } = item;
            if (Button && toolbar) {
                return (
                    <Button
                        data-container={container}
                        data-toolbar={id}
                        editor={editor}
                        key={`ar-rte-toolbar-btn-${id}`}
                        onMouseDown={e => e.preventDefault()}
                    />
                );
            }
        })}
    </div>
);

const Toolbar = ({ className, id, style }) => {
    const editor = useSlate();

    const containerRef = useRef();

    if (typeof window === 'undefined') return null;

    const { range, rect, selected } = useSelected();

    const [state, setState] = useDerivedState({});

    const getPosition = () => {
        const element = containerRef.current;
        if (!element || !rect || !selected) return {};

        const minX = 4;
        const minY = 4;

        element.style.display = 'block';
        element.classList.remove('invert');
        element.classList.remove('no-arrow');

        let { x, width, height, top: y } = rect;

        x = x - element.offsetWidth / 2;
        x += width / 2;
        x = Math.max(minX, x);

        const h = element.offsetHeight + height;
        y -= h;
        y = Math.max(minY, y);

        if (x === minX) {
            element.classList.add('no-arrow');
        }

        if (y === minY) {
            y = rect.bottom + height;
            element.classList.add('invert');
        }
        return { left: x, top: y, opacity: 1 };
    };

    const render = useMemo(() => {
        const _style = {
            ...style,
            ...getPosition(),
            display: selected ? 'block' : 'none',
        };

        return (
            <Portal>
                <div style={_style} ref={containerRef} className={className}>
                    <Buttons
                        container={id}
                        editor={editor}
                        nodes={Reactium.RTE.nodes}
                    />
                </div>
            </Portal>
        );
    });

    return render;
};

Toolbar.defaultProps = {
    style: {},
};

export { Toolbar as default };
