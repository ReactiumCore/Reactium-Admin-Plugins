import _ from 'underscore';
import op from 'object-path';
import Thumb from './Scene/Thumb';
import Action from './Scene/Action';
import Upload from './Scene/Upload';
import Library from './Scene/Library';
import External from './Scene/External';
import React, { useEffect, useState } from 'react';
import Settings from './Scene/Thumb/carousel/Settings';
import useDirectories from '../../Directory/useDirectories';

import Reactium, {
    __,
    useEventHandle,
    useHookComponent,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const useConfig = ({ editor, fieldName }, deps = []) => {
    const [config, updateConfig] = useState();

    useEffect(() => {
        if (!editor) return;
        if (!fieldName) return;
        if (!editor.value) return;

        const value = op.get(editor.value, ['meta', fieldName, 'config'], {
            animationSpeed: 0.5,
            autoplay: true,
            className: null,
            duration: 10,
            loop: true,
        });

        updateConfig(value);
    }, deps);

    return [config, updateConfig];
};

const useSlides = ({ editor, fieldName }, deps = []) => {
    const [slides, setSlides] = useState();

    useEffect(() => {
        if (!editor) return;
        if (!fieldName) return;
        if (!editor.value) return;

        const value = op.get(editor.value, ['meta', fieldName, 'slides']);
        setSlides(value);
    }, deps);

    return [slides, setSlides];
};

const useValue = ({ editor, fieldName }, deps = []) => {
    const [value, setValue] = useState();

    useEffect(() => {
        if (!editor) return;
        if (!fieldName) return;
        if (!editor.value) return;
        let newValue = op.get(editor.value, fieldName, []);
        newValue = op.get(newValue, 'className') ? [] : newValue;
        newValue = newValue.map(({ objectId, url }) => ({ objectId, url }));

        setValue(newValue);
    }, deps);

    return [value, setValue];
};

const initialActive = (max, value) => {
    if (value.length > 0) return 'thumb';
    return 'action';
};

export const Editor = props => {
    const refs = useRefs();
    const { editor, fieldName, max, required } = props;

    const ElementDialog = useHookComponent('ElementDialog');
    const { Button, Dropzone, Icon, Scene } = useHookComponent('ReactiumUI');

    let type = op.get(props, 'type', ['all']);
    type = Array.isArray(op.get(props, 'type', ['all'])) ? type : [type];

    const dirs = useDirectories() || [];
    const [value, setSelection] = useValue({ editor, fieldName });
    const [slides, setSlides] = useSlides({ editor, fieldName });
    const [config, updateConfig] = useConfig({ editor, fieldName });
    const [active, setActive, isActive] = useStatus(
        editor.isNew() ? 'action' : null,
    );
    const [directories, updateDirectories] = useState(dirs);

    const setDirectories = newDirectories => {
        if (editor.unMounted()) return;

        if (_.isString(newDirectories)) {
            newDirectories = String(newDirectories)
                .replace(/ /g, '-')
                .replace(/[^a-z0-9\-\_\/]/gi, '')
                .toLowerCase();

            newDirectories = newDirectories.startsWith('/')
                ? newDirectories.substr(1)
                : newDirectories;

            newDirectories = _.flatten([directories, newDirectories]);
        }

        newDirectories = !newDirectories
            ? []
            : _.chain(newDirectories)
                  .compact()
                  .uniq()
                  .value();

        newDirectories.sort();

        updateDirectories(newDirectories);
    };

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
        _.defer(() => nav('thumb', 'left'));
    };

    const cx = Reactium.Utils.cxFactory('field-media');

    const back = () => refs.get('scene').back();

    const browseFiles = () => {
        const dropzone = refs.get('dropzone');
        dropzone.browseFiles();
    };

    const isReady = () => {
        if (!active) return;
        if (!editor) return;
        if (editor.isNew()) return true;
        if (!value) return;
        return true;
    };

    const nav = (panel, direction) => {
        const scene = refs.get('scene');
        if (scene) {
            scene.navTo({ panel, direction });
        }
    };

    const remove = async objectId => {
        const values = Array.from(value);

        values.forEach((item, i) => {
            if (item.objectId === objectId) {
                op.set(item, 'delete', true);
                if (slides && Array.isArray(slides) && slides[i]) {
                    op.del(slides, [i]);
                }
            }
        });

        const count = _.reject(values, { delete: true }).length;
        if (max === 1 || count < 1) await nav('action', 'right');

        setSelection(values);
        setSlides(slides);
    };

    const removeAll = async (exclude = []) => {
        if (!value) return;
        const values = Array.from(value).filter(
            ({ objectId }) => !exclude.includes(objectId),
        );
        values.forEach(item => op.set(item, 'delete', true));
        await nav('action', 'right');
        setSelection(values);
        setSlides([]);
    };

    const reset = () => {
        // clear editor.media value
        Reactium.Cache.del('editor.media');

        if (!editor.isNew()) return;
        setActive('action');
        removeAll();
    };

    const _handle = () => ({
        ...props,
        add,
        active,
        back,
        browseFiles,
        config,
        cx,
        directories,
        editor,
        isActive,
        nav,
        refs,
        remove,
        removeAll,
        setActive,
        setDirectories,
        setSelection,
        setSlides,
        slides,
        type,
        updateConfig,
        value,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    const onContentValidate = ({ context }) => {
        let values = Array.from(value);
        values = values.filter(item => op.get(item, 'delete', false) !== true);

        if (values.length > 0 || !required) return context;

        const err = {
            field: fieldName,
            message: __('%name is a required parameter').replace(
                /\%name/gi,
                fieldName,
            ),
            value: values,
        };

        context.error[fieldName] = err;
        context.valid = false;

        return context;
    };

    const onContentBeforeSave = e => {
        op.set(e.value, fieldName, value);
        op.set(e.value, ['meta', fieldName, 'slides'], slides);
        op.set(e.value, ['meta', fieldName, 'config'], config);
    };

    const onContentAfterSave = e => {
        op.set(e.value, fieldName, value);
        op.set(e.value, ['meta', fieldName, 'slides'], slides);
        op.set(e.value, ['meta', fieldName, 'config'], config);
    };

    const onFileAdded = async e => {
        const upload = refs.get('upload');
        let { directory } = upload.value;

        if (!isActive('upload')) {
            if (!directory) directory = 'uploads';
            upload.setDirectory(directory);
            await nav('upload', 'left');
        }

        if (!directory) {
            upload.setError(__('Select directory'), e.added);
            return;
        }

        upload.add(Reactium.Media.upload(e.added, directory));
    };

    const showSettings = () => {
        const settings = refs.get('settings');
        if (!settings) return;
        settings.show();
    };

    const headerElements = () =>
        max === 1
            ? []
            : [
                  <Button
                      className='ar-dialog-header-btn'
                      key='config-btn'
                      color={Button.ENUMS.COLOR.CLEAR}
                      onClick={() => showSettings()}
                      style={{ position: 'relative' }}>
                      <Icon name='Linear.Equalizer' />
                  </Button>,
              ];

    // listeners
    useEffect(() => {
        if (!editor) return;

        editor.addEventListener('validate', onContentValidate);
        editor.addEventListener('save-success', onContentAfterSave);
        editor.addEventListener('content-parse', onContentBeforeSave);

        return () => {
            editor.removeEventListener('validate', onContentValidate);
            editor.removeEventListener('save-success', onContentAfterSave);
            editor.removeEventListener('content-parse', onContentBeforeSave);
        };
    });

    // update directories
    useEffect(() => {
        if (!dirs) return;
        const newDirectories = _.chain([directories, dirs])
            .flatten()
            .uniq()
            .value();

        if (!_.isEqual(directories, newDirectories)) {
            setDirectories(newDirectories);
        }
    }, [dirs]);

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

    // initial active
    useEffect(() => {
        if (active || !value) return;
        setActive(initialActive(max, value || []));
    }, [active, max, value]);

    useEffect(() => {
        return () => {
            reset();
        };
    }, []);

    // reset on new
    useEffect(reset, [op.get(editor, 'value.objectId')]);

    return isReady() ? (
        <ElementDialog className={cx()} {...props} elements={headerElements()}>
            <Dropzone
                files={{}}
                onFileAdded={onFileAdded}
                ref={elm => refs.set('dropzone', elm)}>
                <Scene
                    active={active}
                    className={cx('scene')}
                    onChange={({ active }) => setActive(active, true)}
                    ref={elm => refs.set('scene', elm)}>
                    <Action handle={handle} id='action' />
                    <Thumb handle={handle} id='thumb' />
                    <External handle={handle} id='external' />
                    <Library handle={handle} id='library' />
                    <Upload
                        id='upload'
                        handle={handle}
                        ref={elm => refs.set('upload', elm)}
                    />
                </Scene>
            </Dropzone>
            <Settings handle={handle} ref={elm => refs.set('settings', elm)} />
        </ElementDialog>
    ) : null;
};
