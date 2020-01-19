import axios from 'axios';
import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import Pick from './scene/Picker';
import Thumb from './scene/Thumb';
import Config from './scene/Config';
import Delete from './scene/Delete';
import copy from 'copy-to-clipboard';
import ENUMS from 'components/Admin/Media/enums';
import Reactium, {
    __,
    useHandle,
    useHookComponent,
    useRegisterHandle,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

import {
    Button,
    Dialog,
    Icon,
    Prefs,
    Scene,
    Spinner,
} from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ThumbnailSelect
 * -----------------------------------------------------------------------------
 */

const ThumbnailSelect = forwardRef(
    ({ id, property, tooltip, ...props }, ref) => {
        // TODO: Create settings option for these values
        const DEFAULT_OPTIONS = {
            property,
            width: 200,
            height: 200,
            sizes: {
                custom: { label: __('custom') },
                default: { width: 200, height: 200, label: __('default') },
                xs: { width: 48, height: 48, label: __('x-small') },
                sm: { width: 72, height: 72, label: __('small') },
                md: { width: 128, height: 128, label: __('medium') },
                lg: { width: 240, height: 240, label: __('large') },
                xl: { width: 400, height: 400, label: __('x-large') },
            },
        };

        const [picker, setPicker] = useState();

        // MediaEditor Handle
        const { data, setState, state } = useHandle('MediaEditor');

        // Internal state
        const [active, setActive] = useState();

        const [expanded, setExpanded] = useState(
            Prefs.get(`admin.dialog.media.editor.${property}.expanded`),
        );
        const [options, setNewOptions] = useState(DEFAULT_OPTIONS);

        const [size, setSize] = useState('default');

        const [status, setStatus] = useState(ENUMS.STATUS.READY);

        const [thumbnail, setThumbnail] = useState(
            op.get(state, ['value', property]),
        );

        const [thumbrendered, setRendered] = useState(false);

        const [title, setTitle] = useState(props.title);

        const elementRef = useRef({
            image: null,
            input: {},
            scene: null,
        });

        const refs = elementRef.current;

        const tools = useHandle('AdminTools');

        const Toast = op.get(tools, 'Toast');

        const Modal = op.get(tools, 'Modal');

        const MediaPicker = useHookComponent('MediaPicker');

        const deleteThumbnail = () => {
            Reactium.Cloud.run('media-delete-thumbnail', {
                objectId: op.get(state, 'value.objectId'),
                property,
            });

            const { value } = state;
            op.del(value, property);

            setRendered(false);
            setState({ value });
            setThumbnail(undefined);
            navTo('pick', 'right');
        };

        const generateThumb = file =>
            new Promise(async (resolve, reject) => {
                setRendered(false);
                setStatus(ENUMS.STATUS.PROCESSING);

                const isFile = file.constructor === File;
                const reader = new FileReader();
                const readImage = async (ext, data) => {
                    // Render the temp thumbnail
                    renderThumbnail(data);

                    // Send to parse and update the object
                    const params = {
                        ext,
                        field: op.get(options, 'property'),
                        objectId: op.get(state, 'value.objectId'),
                        options: {
                            width: op.get(options, 'width'),
                            height: op.get(options, 'height'),
                        },
                        url: data,
                    };

                    const thm = await Reactium.Cloud.run(
                        'media-image-crop',
                        params,
                    );

                    if (!thm) {
                        Toast.show({
                            icon: 'Feather.AlertOctagon',
                            message: `Unable to save ${String(
                                title,
                            ).toLowerCase()}`,
                            type: Toast.TYPE.ERROR,
                        });

                        setStatus(ENUMS.STATUS.READY);
                        navTo('pick', 'right');
                        return;
                    }

                    Toast.show({
                        icon: 'Feather.Check',
                        message: `${__('Updated')} ${String(
                            title,
                        ).toLowerCase()}!`,
                        type: Toast.TYPE.INFO,
                    });

                    // Preload the image so there's no blink
                    const img = new Image();
                    img.onload = () => {
                        setThumbnail(thm);
                        resolve(thm);
                    };

                    img.src = Reactium.Media.url(thm);
                };

                if (isFile) {
                    const ext = file.name.split('.').pop();
                    reader.onload = () => readImage(ext, reader.result);
                    reader.readAsDataURL(file);
                } else {
                    const ext = op.get(file, 'ext');
                    const url = Reactium.Media.url(file.file);
                    const fetch = await axios.get(url, {
                        responseType: 'blob',
                    });

                    const filedata = op.get(fetch, 'data');
                    reader.onload = () => readImage(ext, reader.result);
                    reader.readAsDataURL(filedata);
                }
            });

        const navTo = (panel, direction = 'left', animationSpeed) => {
            refs.scene.navTo({ animationSpeed, panel, direction });
        };

        const renderThumbnail = (dataURL, imageElement) => {
            let width = op.get(imageElement, 'width');
            let height = op.get(imageElement, 'height');

            const { image } = refs.canvas;

            image.style.opacity = 0;
            image.style.backgroundImage = 'none';
            image.style.width = '100%';
            image.style.height = '100%';

            // navigate to thumbnail
            navTo('thumb');

            const {
                width: containerWidth,
                height: containerHeight,
            } = image.getBoundingClientRect();

            if (width && height) setOptions({ width, height });

            width =
                width ||
                op.get(
                    options,
                    'width',
                    op.get(options, 'sizes.default.width', 200),
                );

            height =
                height ||
                op.get(
                    options,
                    'height',
                    op.get(options, 'sizes.default.height', 200),
                );

            image.style.backgroundImage = `url('${dataURL}')`;
            image.style.width = `${width}px`;
            image.style.height = `${height}px`;

            let {
                width: imageWidth,
                height: imageHeight,
            } = image.getBoundingClientRect();

            if (width > containerWidth) {
                const r = containerWidth / width;
                const h = height * r;
                image.style.width = `${containerWidth}px`;
                image.style.height = `${h}px`;
            }

            if (height > containerHeight) {
                const r = containerHeight / height;
                const w = width * r;
                image.style.height = `${containerHeight}px`;
                image.style.width = `${w}px`;
            }

            image.style.opacity = 1;
            setRendered(true);
        };

        const setOptions = newOptions =>
            setNewOptions({
                ...options,
                ...newOptions,
            });

        const setRef = (elm, ref) => op.set(refs, ref, elm);

        const showPicker = () => {
            Modal.show(
                <MediaPicker
                    confirm
                    dismissable
                    filter='image'
                    ref={elm => setPicker(elm)}
                    title={__('Select Image')}
                />,
            );
        };

        const onCollapse = e => {
            if (active !== 'delete') return;
            navTo('thumb', 'right', 0.001);
        };

        const onExpand = e => {
            if (expanded) return;

            const image = op.get(refs, 'canvas.image');
            image.style.width = 'auto';
            image.style.height = '100%';

            onThumbnailUpdate();
            setExpanded(true);
        };

        const onFileSelect = e => {
            const files = e.target.files;
            if (files.length < 1) return;
            generateThumb(files[0]).then(() => setStatus(ENUMS.STATUS.READY));
        };

        const onMediaDismiss = () => {
            Modal.dismiss();
        };

        const onMediaSelect = e => {
            const files = Object.values(e.target.value);
            if (files.length < 1) return;
            generateThumb(files[0]).then(() => setStatus(ENUMS.STATUS.READY));
        };

        const onOptionChange = e => {
            if (!e.target.dataset.key) return;
            const value = e.target.value;
            const key = e.target.dataset.key;
            setOptions({ [key]: value });
        };

        const onSceneChange = ({ active: current, previous }) => {
            switch (previous) {
                case 'thumb':
                    refs.input.file.type = 'text';
                    refs.input.file.type = 'file';
                    break;

                case 'delete':
                    setTitle(props.title);
                    break;
            }

            switch (current) {
                case 'delete':
                    setTitle(`${__('Delete')} ${title}`);
                    break;
            }

            setActive(current);
        };

        const onSizeChange = e => setSize(e.item.value);

        const onThumbnailUpdate = () => {
            const image = op.get(refs, 'canvas.image');
            if (!image || !thumbnail || thumbrendered) return;

            image.style.opacity = 0;
            const thumbURL = Reactium.Media.url(thumbnail);
            const img = new Image();
            img.onload = () => {
                const { sizes } = options;
                setSize(
                    Object.keys(sizes).reduce((sel, key) => {
                        const item = sizes[key];
                        const w = op.get(item, 'width');
                        const h = op.get(item, 'height');

                        if (w === img.width && h === img.height) {
                            sel = key;
                        }

                        return sel;
                    }, 'custom'),
                );

                setOptions({ width: img.width, height: img.height });
                renderThumbnail(thumbURL, {
                    width: img.width,
                    height: img.height,
                });
            };
            img.src = thumbURL;
        };

        const render = () => (
            <Dialog
                onCollapse={e => onCollapse(e)}
                onExpand={e => onExpand(e)}
                header={{ title }}
                pref={`admin.dialog.media.editor.${property}`}>
                <input
                    hidden
                    onChange={e => onFileSelect(e)}
                    ref={elm => setRef(elm, 'input.file')}
                    type='file'
                    visibility='hidden'
                />
                <Scene
                    active={active}
                    width='100%'
                    height={280}
                    onChange={e => onSceneChange(e)}
                    ref={elm => setRef(elm, 'scene')}>
                    <Config {...handle()} id='config' />
                    <Pick {...handle()} id='pick' />
                    <Thumb {...handle()} id='thumb' />
                    <Delete {...handle()} id='delete' />
                </Scene>
                {status === ENUMS.STATUS.PROCESSING && (
                    <div className='admin-thumbnail-select-blocker'>
                        <Spinner />
                    </div>
                )}
            </Dialog>
        );

        const handle = () => ({
            active,
            data,
            deleteThumbnail,
            id,
            navTo,
            onOptionChange,
            onFileSelect,
            onSceneChange,
            onSizeChange,
            options,
            property,
            refs,
            setOptions,
            setRef,
            setSize,
            setState,
            setStatus,
            setThumbnail,
            showPicker,
            size,
            state,
            status,
            thumbnail,
            title,
        });

        useRegisterHandle(id, handle, [
            active,
            options,
            property,
            refs,
            size,
            status,
            thumbnail,
            title,
        ]);

        // Set active
        useEffect(() => {
            if (active) return;
            const current = thumbnail ? 'thumb' : 'pick';
            setActive(current);
        }, [active, thumbnail]);

        // Set size
        useEffect(() => {
            const { sizes } = options;
            const { width, height } = sizes[size];
            setOptions({ width, height });
        }, [size]);

        // Thumbnail hide if collapsed
        useEffect(() => {
            const image = op.get(refs, 'canvas.image');
            if (!image || expanded === true) return;
            image.style.opacity = 0;
        }, [expanded, op.get(refs, 'canvas.image')]);

        // Thumbnail update
        useEffect(() => {
            if (!expanded || active !== 'thumb') return;
            onThumbnailUpdate();
        }, [active, thumbnail]);

        // Picker Ref
        useEffect(() => {
            if (!picker) return;
            const listeners = [
                [picker, 'change', onMediaSelect],
                [picker, 'dismiss', onMediaDismiss],
            ];

            listeners.forEach(([target, event, callback]) =>
                target.addEventListener(event, callback),
            );

            return () => {
                listeners.forEach(([target, event, callback]) =>
                    target.removeEventListener(event, callback),
                );
            };
        }, [picker]);

        return render();
    },
);

ThumbnailSelect.defaultProps = {
    property: 'thumbnail',
    title: __('Thumbnail'),
};

export default ThumbnailSelect;
