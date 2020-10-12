import React, {
    forwardRef,
    useState,
    useEffect,
    useImperativeHandle,
} from 'react';
import Reactium, {
    __,
    useHandle,
    useRefs,
    useHookComponent,
    useEventHandle,
    ComponentEvent,
} from 'reactium-core/sdk';
import MediaToolScenes, { SCENES } from './Scenes';
import useDirectoryState from './useDirectoryState';
import op from 'object-path';
import _ from 'underscore';

import Action from './Action';
import Thumb from './Thumb';
import ENUMS from './enums';

export { ENUMS };

const MediaTool = forwardRef((props, mediaToolRef) => {
    const { value: propValue, pickerOptions } = props;
    const max = op.get(pickerOptions, 'maxSelect', 1);
    const refs = useRefs();
    const tools = useHandle('AdminTools');
    const { Dropzone } = useHookComponent('ReactiumUI');

    const Modal = op.get(tools, 'Modal');
    const [value, setValue] = useState(propValue || []);
    const setSelection = values => {
        setValue(values);
        const evt = new ComponentEvent('media-selected', {
            values,
            type: 'media-selected',
        });
        mediaToolRef.current.dispatchEvent(evt);
    };

    const [directories, setDirectories] = useDirectoryState();
    const cx = Reactium.Utils.cxFactory('media-tool');
    const selection = values => _.reject(values || value, { delete: true });

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
        setSelection(values);
    };

    const remove = async objectId => {
        const values = Array.from(value);

        values.forEach(item => {
            if (item.objectId === objectId) op.set(item, 'delete', true);
        });

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
        cx,
        directories,
        nav,
        refs,
        remove,
        removeAll,
        setDirectories,
        setSelection,
        value,
        setValue,
        selection,
        pickerOptions,
    });

    const [handle, setHandle] = useEventHandle(_handle());
    useImperativeHandle(mediaToolRef, () => handle, [handle]);
    useEffect(() => {
        setHandle(_handle());
    }, [value]);

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
            <div className={cx('value', { empty: selection().length < 1 })}>
                <Dropzone
                    ref={dz => refs.set('root-dropzone', dz)}
                    files={{}}
                    onFileAdded={onFileAdded}
                    config={{
                        chunking: false,
                        clickable: true,
                    }}>
                    {renderPreview()}
                </Dropzone>
            </div>
        );
    };

    return render();
});

MediaTool.ENUMS = ENUMS;

export default MediaTool;
