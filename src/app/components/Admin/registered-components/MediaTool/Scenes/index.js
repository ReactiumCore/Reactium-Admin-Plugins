import _ from 'underscore';
import op from 'object-path';
// import Thumb from '../Thumb';
// import Action from './Scene/Action';
import Upload from './Scene/Upload';
import Library from './Scene/Library';
import External from './Scene/External';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';

import Reactium, {
    __,
    useEventHandle,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

export const SCENES = {
    library: 'Library',
    external: 'External',
    upload: 'Upload',
};

const MediaToolScenes = forwardRef((props, scenesRef) => {
    const {
        refs,
        add,
        remove,
        removeAll,
        cx,
        max,
        value,
        setSelection,
        directories,
        setDirectories,
        onCloseSelect,
    } = props;

    let type = op.get(props, 'type', ['all']);
    type = Array.isArray(op.get(props, 'type', ['all'])) ? type : [type];

    const [active, setActive, isActive] = useStatus(SCENES.upload);

    const ElementDialog = useHookComponent('ElementDialog');
    const { Dropzone, Scene } = useHookComponent('ReactiumUI');

    const back = () => refs.get('scene').back();

    const browseFiles = () => {
        const dropzone = refs.get('root-dropzone');
        dropzone.browseFiles();
    };

    const nav = (panel, direction) => {
        const scene = refs.get('scene');
        if (scene) {
            scene.navTo({ panel, direction });
        }
    };

    // TODO trigger something
    const reset = () => {
        // clear editor.media value
        Reactium.Cache.del('editor.media');

        // setActive('action');
        // removeAll();
    };

    const onFileAdded = async e => {
        const upload = refs.get('upload');
        let { directory } = upload.value;

        if (!isActive(SCENES.upload)) {
            if (!directory) directory = 'uploads';
            upload.setDirectory(directory);
            await nav(SCENES.upload, 'left');
        }

        if (!directory) {
            upload.setError(__('Select directory'), e.added);
            return;
        }

        upload.add(Reactium.Media.upload(e.added, directory));
    };

    const _handle = () => ({
        max,
        add,
        active,
        back,
        browseFiles,
        cx,
        directories,
        isActive,
        nav,
        refs,
        remove,
        removeAll,
        setActive,
        setDirectories,
        setSelection,
        type,
        value,
        onFileAdded,
        onCloseSelect,
    });

    const [handle, setHandle] = useEventHandle(_handle());
    useImperativeHandle(scenesRef, () => handle, [handle]);

    // update handle on value change
    const updateHandle = () => {
        const newHandle = _handle();
        if (_.isEqual(newHandle, handle)) return;

        Object.keys(newHandle).forEach(key =>
            op.set(handle, key, newHandle[key]),
        );

        setHandle(handle);
    };

    useEffect(updateHandle);

    // reset on new
    // TODO: Externalize this. Put reset on handle, let parent component do this
    // useEffect(reset, [op.get(editor, 'value.objectId')]);

    return (
        <div className={cx()}>
            <Dropzone
                config={{
                    chunking: false,
                    clickable: true,
                }}
                files={{}}
                onFileAdded={onFileAdded}
                ref={elm => refs.set('dropzone', elm)}>
                <Scene
                    active={active}
                    className={cx('scene')}
                    onChange={({ active }) => setActive(active, true)}
                    ref={elm => refs.set('scene', elm)}>
                    <External handle={handle} id={SCENES.external} />
                    <Library handle={handle} id={SCENES.library} />
                    <Upload
                        handle={handle}
                        id={SCENES.upload}
                        ref={elm => refs.set('upload', elm)}
                    />
                </Scene>
            </Dropzone>
        </div>
    );
});

export default MediaToolScenes;
