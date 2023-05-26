import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import { Button, Icon, Spinner } from 'reactium-ui';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useRouteParams } from 'reactium-admin-core';
import { useContentTypes } from '../TypeList/useContentTypes';

import Reactium, {
    __,
    cxFactory,
    useAsyncEffect,
    useHookComponent,
    useRefs,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

const min = 0;
const iw = 400;

export const NewContentButton = () => {
    const params = useRouteParams();
    const type = op.get(params, 'type');

    return (
        type &&
        params && (
            <Button
                outline
                size='xs'
                color='primary'
                appearance='pill'
                className='mr-xs-24'
                onClick={() => Reactium.Content.newObject(type)}
            >
                <Icon name='Feather.Plus' size={18} />
                <span className='hide-xs show-md ml-xs-12'>
                    {__('New %type').replace(/%type/gi, type)}
                </span>
            </Button>
        )
    );
};

const initialSidebarWidth = () => {
    const size = Reactium.Prefs.get('content-editor-sidebar') || {
        width: iw,
    };

    const max =
        window.innerWidth > 990 ? window.innerWidth / 2 : window.innerWidth;

    let w = op.get(size, 'width', iw);
    w = w < min ? min : w;
    w = w > max ? max : w;

    size.width = w;

    return size;
};

export const ContentEditor = ({ className, namespace }) => {
    const refs = useRefs();

    const params = useRouteParams();

    const [types] = useContentTypes(false);

    const { Form } = useHookComponent('ReactiumUI');

    const state = useSyncState({
        params,
        obj: false,
        ready: false,
        sidebarSize: initialSidebarWidth(),
    });

    const cx = cxFactory(namespace);

    const isNew = useMemo(() => op.get(params, 'slug') === 'new', [params]);

    const isReady = useMemo(() => state.get('ready'), [state.get('ready')]);

    const isType = useMemo(() => !!state.get('type'), [state.get('type')]);

    const hasElements = useCallback(
        () => _.flatten(Object.values(elements)).length > 0,
        [elements],
    );

    const defaultValue = useCallback(() => {
        if (!isNew) return;
        if (!hasElements()) return;

        const elms = _.flatten(Object.values(elements));

        const values = elms.reduce((obj, item) => {
            const k = op.get(item, 'fieldName');
            const v = op.get(item, 'defaultValue');

            if (k && v) op.set(obj, k, v);

            return obj;
        }, {});

        state.Form.setValue(values);
    }, [isNew]);

    const initialValue = useCallback(() => {
        if (!isReady) return;
        if (!state.Form) return;

        const obj = state.get('obj');
        let value = null;

        if (obj) {
            const val = obj.toJSON();
            const data = obj.get('data');

            value = { ...data, ...val };
            delete value.data;
        }

        state.Form.setValue(value);
    }, [isReady]);

    const retrieve = useCallback(
        async (mounted) => {
            if (isReady) return;

            const type = op.get(params, 'type');
            const uuid = op.get(params, 'slug');

            if (!uuid) return;

            const obj =
                !isNew && uuid ? await Reactium.Content.retrieve(uuid) : null;

            if (!mounted()) return;

            state.set(
                {
                    obj,
                    isNew,
                    params,
                    updated: Date.now(),
                    uuid: isNew ? null : uuid,
                },
                true,
            );

            await Promise.all([
                Reactium.Hook.run('content-editor-load', {
                    state,
                    params,
                    mounted,
                }),
                Reactium.Hook.run(`content-editor-load-${type}`, {
                    state,
                    params,
                    mounted,
                }),
            ]);

            if (!mounted()) return;

            state.set('ready', true);
        },
        [isReady],
    );

    const onChange = (e) => {
        if (!isReady) return;
        // console.log(e.target.value);
    };

    const onChangeUUID = useCallback(() => {
        const uuid = state.get('params.uuid');

        if (uuid === op.get(params, 'slug')) return;

        if (state.Form) state.Form.setValue(null);

        state.set({ obj: null, ready: false });
    }, [params]);

    const onParamTypeChange = useCallback(() => {
        if (!types || !params) return;
        const { type: machineName } = params;

        const type = _.findWhere(types, { machineName });
        if (type) state.set({ type });
    }, [types, params]);

    const onReady = useCallback(
        async (mounted) => {
            if (isReady) return;

            const type = op.get(params, 'type');

            await Promise.all([
                Reactium.Hook.run('content-editor-ready', {
                    state,
                    params,
                    mounted,
                }),
                Reactium.Hook.run(`content-editor-ready-${type}`, {
                    state,
                    params,
                    mounted,
                }),
            ]);
        },
        [isReady],
    );

    const onSubmit = useCallback(
        async (e) => {
            if (!isReady) return;

            let { meta, slug, status, user, uuid, title, ...data } = _.clone(
                e.value,
            );

            const cleanseData = [
                'ACL',
                'createdAt',
                'updatedAt',
                'taxonomy',
                'objectId',
                'type',
                'user',
            ];
            cleanseData.forEach((field) => op.del(data, field));

            const type = state.get('params.type');
            user = op.get(user, 'objectId');

            const values = {
                data,
                meta,
                slug,
                status,
                title,
                type,
                user,
                uuid,
            };

            try {
                const results = await Reactium.Content.save(values);
                e.target.complete(results);
            } catch (err) {
                e.target.setError('submit', err.message);
            }
        },
        [isReady],
    );

    const onComplete = useCallback(async (e) => {
        const object = e.results;

        console.log(object.get('uuid'));

        await Reactium.Hook.run('content-after-save', state);

        const { Toast } = Reactium.State.Tools;

        const message = __('Saved %title').replace(
            /%title/gi,
            object.get('title'),
        );

        Toast.show({
            message,
            autoClose: 2500,
            type: Toast.TYPE.SUCCESS,
            icon: <Icon name='Feather.Check' style={{ marginRight: 12 }} />,
        });

        if (isNew) {
            Reactium.Routing.history.push(
                `/admin/content/${params.type}/${object.get('uuid')}`,
            );
        }
    }, []);

    const onValidate = useCallback((e) => {
        console.log('Editor', e.type);
    }, []);

    const setForm = useCallback((elm) => {
        if (state.Form) return;
        state.Form = elm;
        state.update();
    }, []);

    const onResize = useCallback((e, d, ref, s) => {
        if (unMounted()) return;

        ref.classList.remove('resizable');

        const container = refs.get('sidebarContainer');
        const size = state.get('sidebarSize');

        size.width = container.offsetWidth;

        Reactium.Prefs.set('content-editor-sidebar', size);
        state.set('sidebarSize', size);
    }, []);

    const onResized = useCallback((e, d, ref, s) => {
        if (unMounted()) return;

        ref.classList.add('resizable');

        const container = refs.get('sidebarContainer');
        let dir = s.width !== 0 && s.width < 0 ? 'right' : 'left';
        dir = s.width === 0 ? 'reset' : dir;

        let w = container.offsetWidth;

        if (dir !== 'reset') {
            const max = window.innerWidth / 2;
            w = w <= iw && dir === 'left' ? iw : w;
            w = w <= iw && dir === 'right' ? min : w;
            w = w >= max ? max : w;
        } else {
            const v = Math.abs(w - iw);
            w = v <= 2 ? min : iw;
        }

        const size = state.get('sidebarSize');
        size.width = w;

        Reactium.Prefs.set('content-editor-sidebar', size);
        state.set('sidebarSize', size);
    }, []);

    const unMounted = () => !refs.get('container');

    const regions = useMemo(() => {
        if (!isType) return [];

        return Array.from(Object.values(state.get('type.regions')));
    }, [state.get('type')]);

    const elements = useMemo(() => {
        if (!isType) return {};

        const type = state.get('type.machineName');

        let fields = _.clone(state.get('type.fields'));
        if (!fields) return {};
        op.del(fields, 'publisher');

        fields = Array.from(Object.values(fields));

        Reactium.Hook.runSync('content-editor-elements', fields, state);

        Reactium.Hook.runSync(`content-editor-elements-${type}`, fields, state);

        fields = fields.map((item) => {
            const { component } = Reactium.Content.Editor.get(item.fieldType);
            if (component && !item.Component) item.Component = component;
            return item.Component ? item : null;
        });

        return _.chain(fields).compact().groupBy('region').value();
    }, [state.get('type')]);

    useEffect(onChangeUUID, [params]);

    useEffect(onParamTypeChange, [params, types]);

    useEffect(initialValue, [isReady, state.get('obj')]);

    useAsyncEffect(retrieve, [params, isReady]);

    useAsyncEffect(onReady, [isReady]);

    useEffect(defaultValue, [elements, isNew, isReady, state.get('obj')]);

    state.extend('cx', cx);

    state.extend('hasElements', hasElements);

    state.extend('unMounted', unMounted);

    state.extend('update', () => state.set('updated', Date.now()));

    state.isNew = isNew;

    state.isReady = isReady;

    state.isType = isType;

    state.elements = elements;

    state.regions = regions;

    state.types = types;

    state.refs = refs;

    return !isReady ? (
        <Spinner className={cx('spinner')} />
    ) : (
        <Form
            ref={setForm}
            onChange={onChange}
            onComplete={onComplete}
            onSubmit={onSubmit}
            onValidate={onValidate}
        >
            {state.Form && (
                <div
                    ref={(elm) => refs.set('container', elm)}
                    className={cn(cx(), cx(state.get('type')), className)}
                >
                    {regions.map((region, i) =>
                        String(region.id).startsWith('sidebar') ? (
                            <ResizeWrap
                                key={`region-${i}`}
                                className={cn(cx('column'), 'resizable')}
                                size={
                                    state.get('sidebarSize') ||
                                    initialSidebarWidth()
                                }
                                onResizeStop={onResized}
                                onResize={onResize}
                            >
                                <div
                                    className={cx('sidebar-placeholder')}
                                    ref={(elm) =>
                                        refs.set('sidebarContainer', elm)
                                    }
                                />
                                <div
                                    className={cn(
                                        cx('sidebar'),
                                        cx(`sidebar-${region.id}`),
                                    )}
                                >
                                    {elements[region.id].map(
                                        ({ Component, ...item }) => (
                                            <div
                                                key={item.fieldId}
                                                className={cn(
                                                    cx('sidebar-element'),
                                                    cx(
                                                        `sidebar-element-${item.fieldId}`,
                                                    ),
                                                )}
                                            >
                                                <Component
                                                    {...item}
                                                    key={item.fieldId}
                                                    editor={state}
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </ResizeWrap>
                        ) : (
                            <div
                                key={`region-${i}`}
                                className={cn(cx('column'))}
                            >
                                <div
                                    className={cn(
                                        cx(region.id),
                                        `content-editor-${region.id}`,
                                    )}
                                >
                                    {elements[region.id].map(
                                        ({ Component, ...item }) => (
                                            <div
                                                key={item.fieldId}
                                                className={cn(
                                                    cx('element'),
                                                    cx(
                                                        `element-${item.fieldId}`,
                                                    ),
                                                )}
                                            >
                                                <Component
                                                    {...item}
                                                    editor={state}
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </Form>
    );
};

ContentEditor.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

ContentEditor.defaultProps = {
    namespace: 'admin-content-editor',
};

const ResizeWrap = forwardRef(
    ({ children, className, size, onResizeStop, onResize }, ref) => {
        const [winSize, setSize] = useState(window ? window.innerWidth : 0);

        const onWindowResize = useCallback(() => {
            setSize(window.innerWidth);
        }, [window]);

        useEffect(() => {
            if (!window) return;
            window.addEventListener('resize', onWindowResize);
            return () => {
                window.removeEventListener('resize', onWindowResize);
            };
        }, [window]);

        return winSize <= 990 ? (
            <div className={className} children={children} ref={ref} />
        ) : (
            <Resizable
                ref={ref}
                size={size}
                minWidth={min}
                maxWidth={window.innerWidth / 2}
                children={children}
                className={className}
                handleStyles={{ right: { width: 25 } }}
                onResizeStop={onResizeStop}
                onResize={onResize}
                enable={{
                    top: false,
                    right: false,
                    bottom: false,
                    left: true,
                    topRight: false,
                    bottomRight: false,
                    bottomLeft: false,
                    topLeft: false,
                }}
                handleClasses={{
                    top: 'handle-top',
                    topRight: 'handle-top-right',
                    topLeft: 'handle-top-left',
                    bottom: 'handle-bottom',
                    bottomRight: 'handle-bottom-right',
                    bottomLeft: 'handle-bottom-left',
                    left: 'handle-left',
                    right: 'handle-right',
                }}
            />
        );
    },
);
