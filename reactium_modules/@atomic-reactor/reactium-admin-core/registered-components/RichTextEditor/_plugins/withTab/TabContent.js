import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useState } from 'react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const TabContent = props => {
    const { state } = props;

    const { Button } = useHookComponent('ReactiumUI');

    const [item, setItem] = useState(state.content[state.active]);

    const cx = Reactium.Utils.cxFactory('rte-tabs-content');

    const isEmpty = () => {
        const items = _.compact(Array.isArray(item) ? item : [item]);
        if (items.length < 1) return true;
        const node = _.first(items);
        return op.get(node, 'type') === 'empty';
    };

    const isExpanded = () => {
        const { expanded, vertical } = state;
        if (vertical !== true) return true;
        return expanded;
    };

    useEffect(() => {
        if (typeof op.get(state, 'active') === 'undefined') return;
        if (state.updated === null) return;
        if (!state.content) return;

        let newItem = state.content[state.active];
        if (!newItem) return;

        props.setContent(state.active, newItem);
        setItem(newItem);
    }, [state.updated]);

    return isExpanded() === false ? null : isEmpty() ? (
        <div className={cx()}>
            <div className='empty'>
                <Button
                    size='md'
                    appearance='pill'
                    onClick={props.showEditor}
                    children={__('Create Tab Content')}
                />
            </div>
        </div>
    ) : (
        <div className={cx()}>
            <div style={{ pointerEvents: 'none' }}>{props.children}</div>
            <div className='blocker' />
            <Button
                size='md'
                className='edit'
                appearance='pill'
                onClick={props.showEditor}
                children={__('Edit Tab Content')}
            />
        </div>
    );
};

export default TabContent;
