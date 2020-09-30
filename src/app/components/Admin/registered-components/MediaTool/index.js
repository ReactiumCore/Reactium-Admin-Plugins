import React, { useEffect, useState } from 'react';
import Reactium, {
    __,
    useHandle,
    useRefs,
    useHookComponent,
} from 'reactium-core/sdk';
import MediaToolScenes, { SCENES } from './Scenes';
import useDirectoryState from './useDirectoryState';
import op from 'object-path';
import _ from 'underscore';

import Action from './Action';
import Thumb from './Thumb';

// Notes:
// 1. Stand alone preview for one or more media items or action
// 2. Picker / Uploader
const aNoop = async () => {};
const MediaTool = props => {
    console.log({ props });
    const { max, value: propValue } = props;

    const refs = useRefs();
    const tools = useHandle('AdminTools');
    const { Dropzone, Scene } = useHookComponent('ReactiumUI');

    const Modal = op.get(tools, 'Modal');
    const [value, _setSelection] = useState(propValue || []);
    const [directories, setDirectories] = useDirectoryState();
    const cx = Reactium.Utils.cxFactory('media-tool');

    const setSelection = value => {
        console.log('setSelection', { value }, new Error().stack);
        _setSelection(value);
    };

    const selection = () => _.reject(value, { delete: true });

    const add = (items = []) => {
        items = Array.isArray(items) ? items : [items];
        items = items.map(({ objectId, url }) => ({ objectId, url }));
        items = max === 1 ? [_.last(items)] : items;

        const values = Array.from(value);

        // if single selection, remove all other values
        if (max === 1) values.forEach(item => op.set(item, 'delete', true));

        // add the items to the value
        items.forEach(item => values.push(item));

        // update the selection
        console.log('add', { values });
        setSelection(values);

        // show thumbs
        // _.defer(() => nav('thumb', 'left'));
    };

    console.log({ value });

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

    const nav = async (scene, direction) => {
        if (!scene) return;

        const scenes = await openScenes();
        const { nav, isActive } = scenes;
        if (!isActive(scene)) {
            await nav(scene, direction);
        }
    };

    const onFileAdded = async e => {
        await nav(SCENES.upload, 'left');
        const upload = refs.get('upload');

        const directory =
            op.get(upload.value, 'directory', props.directory) ||
            props.directory ||
            'uploads';
        upload.setDirectory(directory);

        if (!directory) {
            upload.setError(__('Select directory'), e.added);
            return;
        }

        upload.add(Reactium.Media.upload(e.added, directory));
    };

    const _handle = () => ({
        max,
        add,
        // active,
        // back,
        // browseFiles,
        cx,
        directories,
        // isActive,
        nav,
        refs,
        remove,
        removeAll,
        // setActive,
        setDirectories,
        setSelection,
        // type,
        value,
        // onFileAdded,
    });

    const openScenes = async () => {
        let scenes = refs.get('scenes');
        if (!scenes) {
            scenes = await new Promise(resolve => {
                Modal.show(
                    <div style={{ width: '80vw', height: '100vh' }}>
                        <MediaToolScenes
                            ref={c => {
                                refs.set('scenes', c);
                                resolve(c);
                            }}
                            {...props}
                            {..._handle()}
                            onCloseSelect={() => Modal.hide()}
                        />
                    </div>,
                );
            });
        }

        return scenes;
    };

    const renderPreview = () => {
        if (selection().length < 1) {
            return <Action handle={_handle()} />;
        }

        return <Thumb handle={_handle()} />;
    };

    const render = () => {
        if (!Modal) return null;

        return (
            <div className={cx('value')}>
                <Dropzone files={{}} onFileAdded={onFileAdded}>
                    {renderPreview()}
                </Dropzone>
            </div>
        );
    };

    return render();
};

export default MediaTool;
