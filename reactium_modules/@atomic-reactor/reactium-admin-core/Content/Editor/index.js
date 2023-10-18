import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import { Button, Icon, Spinner } from 'reactium-ui';
import { useRouteParams } from 'reactium-admin-core';
import { useContentTypes } from '../TypeList/useContentTypes';

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import Reactium, {
    __,
    cxFactory,
    useDispatcher,
    useAsyncEffect,
    useHookComponent,
    useRefs,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

const min = 0;
const iw = 400;

export const ContentEditor = (props) => {
    const { className, namespace, title } = props;

    const refs = useRefs();

    const params = useRouteParams();

    const [types] = useContentTypes(false);

    const Helmet = useHookComponent('Helmet');

    const { Form } = useHookComponent('ReactiumUI');

    const state = useSyncState({
        params,
        obj: false,
        ready: false,
        valid: false,
        disabled: false,
        sidebarSize: initialSidebarWidth(),
    });

    const cx = cxFactory(namespace);

    const _dispatch = useDispatcher({ props, state });

    const dispatch = (...args) => {
        const evt = String(args.shift());
        const hook = evt.startsWith('content-') ? evt : `content-${evt}`;

        const hooks = runHookSync(hook, ...args);

        _dispatch(evt, ...args);

        return hooks;
    };

    const dispatchAsync = async (...args) => {
        const evt = String(args.shift());
        const hook = evt.startsWith('content-') ? evt : `content-${evt}`;

        const hooks = await runHook(hook, ...args);

        dispatch(evt, ...args);

        return hooks;
    };

    const runHook = useCallback((hook, args) => {
        const type = op.get(params, 'type');

        const detail = { type, state, params, ...args };

        return Promise.all([
            Reactium.Hook.run(hook, detail),
            Reactium.Hook.run(`${hook}-${type}`, detail),
        ]);
    });

    const runHookSync = useCallback((hook, args) => {
        const type = op.get(params, 'type');

        const detail = { type, state, params, ...args };

        return [
            Reactium.Hook.runSync(hook, detail),
            Reactium.Hook.runSync(`${hook}-${type}`, detail),
        ];
    });

    const isNew = useMemo(() => op.get(params, 'slug') === 'new', [params]);

    const isReady = useMemo(() => state.get('ready'), [state.get('ready')]);

    const isType = useMemo(() => !!state.get('type'), [state.get('type')]);

    const isValid = () => {
        if (!state.Form) return false;
        return Object.keys(state.Form.error()).length < 1;
    };

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

    const retrieve = useCallback(async () => {
        if (isReady || isNew) return state.set('ready', true);

        const uuid = op.get(params, 'slug');

        if (!uuid) return state.set('ready', true);

        const obj =
            !isNew && uuid ? await Reactium.Content.retrieve(uuid) : null;

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

        state.set('ready', true);
    }, [isNew, isReady, params]);

    const clearError = (...args) => {
        if (!state.Form) return;
        state.Form.clearError(...args);
        return state;
    };

    const setError = (...args) => {
        if (!state.Form) return;
        state.Form.setError(...args);
        return state;
    };

    const setForm = useCallback((elm) => {
        if (state.Form) return;
        state.Form = elm;
        state.update();
    }, []);

    const setValue = (...args) => {
        if (!state.Form) return state;
        state.Form.setValue(...args);
        return state;
    };

    const onChange = async (e) => {
        if (!isReady) return;

        if (e.path === 'update' && e.detail === null) return;
        const detail = e.detail || { changed: { previous: null } };
        if (op.get(detail, 'changed.previous') === undefined) return;

        await dispatchAsync(e.type, e);
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
            if (!isReady) return;
            if (!mounted()) return;
            if (!state.Form) return;

            if (!isNew) await dispatchAsync('editor-load', { mounted });
            await dispatchAsync('editor-ready', { mounted });
        },
        [isReady, state.Form],
    );

    const onBeforeSubmit = async (e) => {
        await dispatchAsync(e.type, { values: e.target.value });
    };

    const onSubmit = useCallback(async (e) => {
        if (!isReady || !isValid() || state.get('disabled') === true) return;

        let {
            objectId,
            meta,
            slug,
            status,
            uuid,
            title,
            file,
            parent,
            ...data
        } = _.clone(e.value);

        const cleanseData = [
            'ACL',
            'createdAt',
            'updatedAt',
            'taxonomy',
            'objectId',
            'type',
            'user',
            'children',
            'parent',
            'file',
        ];

        cleanseData.forEach((field) => op.del(data, field));

        const type = state.get('params.type');

        const values = {
            objectId,
            data,
            meta,
            slug,
            status,
            title,
            type,
            uuid,
            parent,
            file,
        };

        await Promise.all([
            dispatchAsync('submit', { value: values }),
            dispatchAsync('save', { value: values }),
        ]);

        const results = await Reactium.Content.save(values);

        if (_.isError(results)) {
            e.target.setError('submit', results.message);
            await Promise.all([
                dispatchAsync('submit-error', { error: results, values }),
                dispatchAsync('save-error', { error: results, values }),
            ]);
        } else {
            e.target.complete(results);
        }
    });

    const onComplete = useCallback(async (e) => {
        const object = e.results;

        await dispatchAsync('after-save', { object });

        const { Toast } = Reactium.State.Tools;

        const message = __('Saved %title').replace(
            /%title/gi,
            object.get('title'),
        );

        Toast.show({
            message,
            autoClose: 2500,
            type: Toast.TYPE.SUCCESS,
            icon: <Icon name='Feather.Check' />,
        });

        if (isNew) {
            Reactium.Routing.history.push(
                `/admin/content/${params.type}/${object.get('uuid')}`,
            );
        }
    }, []);

    const onValidate = useCallback(async (e) => {
        await dispatchAsync(e.type, {
            errors: e.target.get('errors'),
            values: e.target.value,
        });
    }, []);

    const onResize = useCallback((e, d, ref, s) => {
        if (unMounted()) return;

        ref.classList.remove('resizable');

        const container = refs.get('sidebarContainer');
        const size = state.get('sidebarSize');

        size.width = container.offsetWidth;

        Reactium.Prefs.set('content-editor-sidebar', size);
        state.set('sidebarSize', size);

        dispatch('resize', { detail: { size } });
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

        dispatch('resized', { detail: { size } });
    }, []);

    const unMounted = () => !refs.get('container');

    const regions = useMemo(() => {
        if (!isType) return [];

        return Array.from(Object.values(state.get('type.regions', {})));
    }, [state.get('type')]);

    const elements = useMemo(() => {
        if (!isType) return {};

        if (!state.get('type.fields')) return {};

        const fields = new FieldRegistry(
            Object.values(_.clone(state.get('type.fields'))),
        );

        fields.remove('publisher');

        runHookSync('content-editor-elements', { fields });

        return fields.regions;
    }, [state.get('type')]);

    useEffect(onChangeUUID, [params]);

    useEffect(onParamTypeChange, [params, types]);

    useEffect(initialValue, [isReady, state.get('obj')]);

    useAsyncEffect(retrieve, [params, isReady]);

    useAsyncEffect(onReady, [isReady]);

    useEffect(defaultValue, [elements, isNew, isReady, state.get('obj')]);

    state.extend('cx', cx);

    state.extend('clearError', clearError);

    state.extend('dispatch', dispatch);

    state.extend('dispatchAsync', dispatchAsync);

    state.extend('runHook', runHook);

    state.extend('runHookSync', runHookSync);

    state.extend('getAttribute', (...args) => op.get(props, ...args));

    state.extend('hasElements', hasElements);

    state.extend('unMounted', unMounted);

    state.extend('update', () => {
        state.set('updated', Date.now());
        return state;
    });

    state.extend('isValid', isValid);

    state.extend('setError', setError);

    state.extend('setValue', setValue);

    state.extend('disable', () => {
        state.set('disabled', true);
        return state;
    });

    state.extend('enable', () => {
        state.set('disabled', false);
        return state;
    });

    state.extend('submit', () => {
        state.Form.submit();
        return state;
    });

    state.extend('retrieve', retrieve);

    state.isNew = isNew;

    state.isReady = isReady;

    state.isType = isType;

    state.elements = elements;

    state.regions = regions;

    state.types = types;

    state.props = props;

    state.refs = refs;

    const render = () => {
        return !isReady ? (
            <Spinner className={cx('spinner')} />
        ) : (
            <Form
                ref={setForm}
                onChange={onChange}
                onSubmit={onSubmit}
                onComplete={onComplete}
                onValidate={onValidate}
                onBeforeSubmit={onBeforeSubmit}
            >
                <Helmet>
                    <title>
                        {String(title).replace('%type', op.get(params, 'type'))}
                    </title>
                </Helmet>
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
                                        {op
                                            .get(elements, [region.id], [])
                                            .map(({ Component, ...item }) => (
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
                                                        params={params}
                                                        key={item.fieldId}
                                                        editor={state}
                                                    />
                                                </div>
                                            ))}
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
                                        {op
                                            .get(elements, [region.id], [])
                                            .map(({ Component, ...item }) => (
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
                                                        params={params}
                                                        editor={state}
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </Form>
        );
    };

    return render();
};

ContentEditor.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

ContentEditor.defaultProps = {
    namespace: 'admin-content-editor',
    title: __('Content Editor / %type'),
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

class FieldRegistry {
    constructor(fields) {
        this.__fields = Array.from(fields || []);
    }

    get list() {
        return _.compact(
            this.__fields.map((item) => {
                try {
                    const { component } = Reactium.Content.Editor.get(
                        item.fieldType,
                    );
                    if (component && !item.Component) {
                        item.Component = component;
                    }
                    return item.Component ? item : null;
                } catch (error) {
                    console.error(error);
                    return null;
                }
            }),
        );
    }

    get regions() {
        return _.chain(this.list).compact().groupBy('region').value();
    }

    get isField() {
        return (fieldId) => !!_.findWhere(this.list, { fieldId });
    }

    get add() {
        return (params, uniq = true) => {
            const { index = -1, ...field } = params;

            if (uniq && this.isField(op.get(params, 'fieldId'))) return;

            if (index < 0) this.__fields.push(field);
            else this.__fields.splice(index, 0, field);

            return this;
        };
    }

    get replace() {
        return (params) => {
            const fieldId = op.get(params, 'fieldId');
            const index = _.findIndex(this.__fields, { fieldId });
            if (index < 0) return;

            this.__fields.splice(index, 1, params);

            return this;
        };
    }

    get remove() {
        return (fieldId) => {
            const index = _.findIndex(this.__fields, { fieldId });

            if (index < 0) return;

            this.__fields.splice(index, 1);

            return this;
        };
    }
}

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
