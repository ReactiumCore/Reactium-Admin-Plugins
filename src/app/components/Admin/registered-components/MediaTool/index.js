import React, { useEffect, useState } from 'react';
import Reactium, { __, useHandle, useRefs } from 'reactium-core/sdk';
import MediaToolScenes from './Scenes';
import useDirectoryState from './useDirectoryState';
import op from 'object-path';
import _ from 'underscore';

// Notes:
// 1. Stand alone preview for one or more media items or action
// 2. Picker / Uploader

const MediaTool = props => {
    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');
    const refs = useRefs();
    const { max, value: propValue } = props;
    const [value, setSelection] = useState(propValue || []);

    const [directories, setDirectories] = useDirectoryState();
    console.log({ refs, tools, Modal });

    const cx = Reactium.Utils.cxFactory('media-tool');

    const add = (items = []) => {
        items = Array.isArray(items) ? items : [items];
        items = items.map(({ objectId, url }) => ({ objectId, url }));
        items = max === 1 ? [_.last(items)] : items;

        const values = Array.from(value);

        // if single selection, remove all other values
        if (max === 1) values.forEach(item => op.set(item, 'delete', true));

        // add the items to the value
        items.forEach(item => values.push(item));

        // update the selection`
        setSelection(values);

        // show thumbs
        // _.defer(() => nav('thumb', 'left'));
    };

    const remove = async objectId => {
        const values = Array.from(value);

        values.forEach(item => {
            if (item.objectId === objectId) op.set(item, 'delete', true);
        });

        // TODO: switch between thumb and action naturally
        // const count = _.reject(values, { delete: true }).length;
        // if (max === 1 || count < 1) await nav('action', 'right');

        setSelection(values);
    };

    const removeAll = async (exclude = []) => {
        if (!value) return;
        const values = Array.from(value).filter(
            ({ objectId }) => !exclude.includes(objectId),
        );
        values.forEach(item => op.set(item, 'delete', true));
        setSelection(values);
    };

    const openScenes = () => {
        const scenes = refs.get('scenes');
        if (!scenes) {
            Modal.show(
                <div style={{ width: '80vw', height: '100vh' }}>
                    <MediaToolScenes
                        ref={c => refs.set('scenes', c)}
                        {...props}
                        refs={refs}
                        cx={cx}
                        add={add}
                        remove={remove}
                        removeAll={removeAll}
                        value={value}
                        setSelection={setSelection}
                        directories={directories}
                        setDirectories={setDirectories}
                    />
                </div>,
            );
        }
    };

    const render = () => {
        return <button onClick={openScenes}>Open Scenes</button>;
    };

    return render();
};

export default MediaTool;
