import _ from 'underscore';
import op from 'object-path';
import { MediaCard } from './Card';
import DefaultEmpty from 'components/Admin/Media/List/Empty';

import { useDerivedState, useEventHandle } from 'reactium-core/sdk';

import React, { useCallback, useRef } from 'react';

const Media = props => {
    const containerRef = useRef();

    const [state, setState] = useDerivedState(props, [
        'data',
        'empty',
        'emptyComponent',
    ]);

    const Empty = useCallback(() =>
        op.get(state, 'emptyComponent', DefaultEmpty),
    );

    const _handle = () => ({
        state,
        setState,
    });

    const [handle] = useEventHandle(_handle());

    const data = useCallback(() =>
        _.sortBy(
            Array.from(Object.entries(state.data)).map(([key, item]) => {
                item['key'] = key;
                return item;
            }),
            'updatedAt',
        ).reverse(),
    );

    return op.get(state, 'empty') ? (
        <Empty />
    ) : (
        <div className='media' ref={containerRef}>
            {data().map(({ key, ...item }) => (
                <MediaCard {...item} key={key} objectId={key} handle={handle} />
            ))}
        </div>
    );
};

Media.defaultProps = {
    data: {},
    empty: false,
};

export { Media, Media as default };
