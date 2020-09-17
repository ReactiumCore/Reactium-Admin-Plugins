import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useState } from 'react';

import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const TabContent = ({ state, setContent, ...props }) => {
    const { Button } = useHookComponent('ReactiumUI');

    const [item, setItem] = useState(state.content[state.active]);

    const _onClick = () => {
        setContent(state.active, {
            text: `Content ${state.tabs[state.active]}`,
        });
    };

    const isEmpty = () => {
        const items = _.compact(Array.isArray(item) ? item : [item]);
        if (items.length < 1) return true;
        const node = _.first(items);
        return op.get(node, 'type') === 'empty';
    };

    useEffect(() => {
        const newItem = state.content[state.active];
        setItem(newItem);
        if (newItem && !_.isEqual(newItem, item)) {
            setContent(state.active, newItem);
        }
    }, [state.active, state.content]);

    return isEmpty() ? (
        <div className='text-center'>
            <Button onClick={_onClick} children={__('Create Tab Content')} />
        </div>
    ) : (
        props.children
    );
};

export default TabContent;
