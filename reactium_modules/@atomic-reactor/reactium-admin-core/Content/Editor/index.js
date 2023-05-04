import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import { Button, Icon, Spinner } from 'reactium-ui';
import React, { useEffect, useMemo } from 'react';
import { useRouteParams } from 'reactium-admin-core';
import { useContentTypes } from '../TypeList/useContentTypes';

import Reactium, {
    __,
    cxFactory,
    useAsyncEffect,
    useHookComponent,
    useRefs,
    useSyncState,
} from 'reactium-core/sdk';

const min = 50;
const max = '50%';
const iwidth = 400;
const width = () => Math.min(Math.max(window.innerWidth, min), iwidth);
const initialSidebarWidth = () => {
    const size = Reactium.Prefs.get('content-editor-sidebar', {
        width: width(),
    });

    op.set(size, 'width', Math.max(size.width, iwidth));

    return size;
};

export const NewContentButton = () => {
    const params = useRouteParams();
    const type = op.get(params, 'type');

    return (
        type && (
            <Button
                outline
                size='xs'
                type='link'
                color='primary'
                appearance='pill'
                className='mr-xs-24'
                to={`/admin/content/${type}/new`}>
                <Icon name='Feather.Plus' size={18} />
                <span className='hide-xs show-md ml-xs-12'>
                    {__('New %type').replace(/%type/gi, type)}
                </span>
            </Button>
        )
    );
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

    const isReady = useMemo(() => state.get('ready'), [state.get('ready')]);

    const isType = useMemo(() => !!state.get('type'), [state.get('type')]);

    const initialValue = () => {
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
    };

    const retrieve = async mounted => {
        if (isReady) return;

        const type = op.get(params, 'type');
        const uuid = op.get(params, 'slug');

        if (!uuid) return;

        const isNew = uuid === 'new';

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
    };

    const onChange = e => {
        if (!isReady) return;
        // console.log(e.target.value);
    };

    const onChangeUUID = () => {
        const uuid = state.get('params.uuid');

        if (uuid === op.get(params, 'slug')) return;

        if (state.Form) {
            state.Form.setValue(null);
        }

        state.set('ready', false, true);
        state.set('obj', null, true);
    };

    const onParamTypeChange = () => {
        if (!types || !params) return;
        const { type: machineName } = params;

        const type = _.findWhere(types, { machineName });
        if (type) state.set({ type });
    };

    const onReady = async mounted => {
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
    };

    const onResize = () => {
        const size = state.get('sidebarSize');
        Reactium.Prefs.set('content-editor-sidebar', size);
    };

    const setSidebarWidth = value => {
        if (unMounted()) return;

        const size = state.get('sidebarSize');
        const container = refs.get('sidebarContainer');
        const w = size.width + value;

        container.style.width = `${w}px`;

        state.set('sidebarSize', { ...size, width: w });
    };

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

        fields = fields.map(item => {
            const { component } = Reactium.Content.Editor.get(item.fieldType);
            if (component && !item.Component) item.Component = component;
            return item.Component ? item : null;
        });

        return _.chain(fields)
            .compact()
            .groupBy('region')
            .value();
    }, [state.get('type')]);

    state.extend('cx', cx);

    useEffect(onChangeUUID, [params]);

    useEffect(onParamTypeChange, [params, types]);

    useEffect(onResize, [state.get('sidebarSize')]);

    useEffect(initialValue, [isReady, state.get('obj')]);

    useAsyncEffect(retrieve, [params, isReady]);

    useAsyncEffect(onReady, [isReady]);

    return !isReady ? (
        <Spinner className={cx('spinner')} />
    ) : (
        <Form
            onChange={onChange}
            ref={elm => {
                state.Form = elm;
            }}>
            <div
                ref={elm => refs.set('container', elm)}
                className={cn(cx(), cx(state.get('type')), className)}>
                {regions.map((region, i) => {
                    const key = `region-${i}`;
                    return String(region.id).startsWith('sidebar') ? (
                        <ResizeWrap
                            key={key}
                            className={cn(cx('column'), 'p-20')}
                            size={state.get('sidebarSize')}
                            setSidebarWidth={setSidebarWidth}>
                            <div
                                className={cx('sidebar-placeholder')}
                                ref={elm => refs.set('sidebarContainer', elm)}
                            />
                            <div className={cx('sidebar')}>
                                {elements[region.id].map(
                                    ({ Component, ...item }) => (
                                        <Component
                                            {...item}
                                            key={item.fieldId}
                                            editor={state}
                                        />
                                    ),
                                )}
                            </div>
                        </ResizeWrap>
                    ) : (
                        <div key={key} className={cn(cx('column'), 'p-20')}>
                            <div
                                className={cn(
                                    cx(region.id),
                                    `content-editor-${region.id}`,
                                )}>
                                {elements[region.id].map(
                                    ({ Component, ...item }) => (
                                        <Component
                                            {...item}
                                            key={item.fieldId}
                                            editor={state}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
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

const ResizeWrap = ({ children, className, size, setSidebarWidth }) => (
    <Resizable
        size={size}
        minWidth={min}
        maxWidth={max}
        children={children}
        className={className}
        handleStyles={{ right: { width: 25 } }}
        onResizeStop={(e, dir, ref, s) => setSidebarWidth(s.width)}
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
