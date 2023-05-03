import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Spinner } from 'reactium-ui';
import { Resizable } from 're-resizable';
import { useRouteParams } from 'reactium-admin-core';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useContentTypes } from '../TypeList/useContentTypes';

import Reactium, {
    __,
    cxFactory,
    useHookComponent,
    useRefs,
    useSyncState,
    Zone,
} from 'reactium-core/sdk';

const min = 0;
const max = '34%';
const width = () => (_.isUndefined(window) ? min : window.innerWidth * 0.4);

const ContentEditor = ({ className, namespace }) => {
    const refs = useRefs();
    const params = useRouteParams();

    const { Form } = useHookComponent('ReactiumUI');

    const [types] = useContentTypes(false);

    const state = useSyncState({
        updated: null,
        value: null,
        sidebarSize: Reactium.Prefs.get('content-editor-sidebar', {
            width: width(),
        }),
    });

    const cx = cxFactory(namespace);

    const isType = useMemo(() => !!state.get('type'), [state.get('type')]);

    const unMounted = () => !refs.get('container');

    const setSidebarWidth = value => {
        if (unMounted()) return;

        const size = state.get('sidebarSize');
        const container = refs.get('sidebarContainer');
        const w = size.width + value;

        container.style.width = `${w}px`;

        state.set('sidebarSize', { ...size, width: w });
    };

    const regions = useMemo(() => {
        if (!isType) return [];

        return Array.from(Object.values(state.get('type.regions')));
    }, [state.get('type')]);

    const elements = useMemo(() => {
        if (!isType) return {};

        const type = state.get('type');
        let fields = _.clone(state.get('type.fields'));
        if (!fields) return {};
        op.del(fields, 'publisher');

        fields = Array.from(Object.values(fields));
        fields = fields.map(item => {
            const { component } = Reactium.Content.Editor.get(item.fieldType);
            if (component) item.Component = component;
            return item;
        });

        console.log(fields);
        return _.chain(fields)
            .compact()
            .groupBy('region')
            .value();
    }, [state.get('type')]);

    state.extend('cx', cx);

    useEffect(() => {
        const uuid = op.get(params, 'slug');
        const isNew = uuid === 'new';
        state.set({ isNew, uuid: isNew ? null : uuid });
    }, [params]);

    useEffect(() => {
        if (!types || !params) return;
        const { type: machineName } = params;

        const type = _.findWhere(types, { machineName });
        if (type) {
            state.set({ type });
        }
    }, [params, types]);

    useEffect(() => {
        const size = state.get('sidebarSize');
        Reactium.Prefs.set('content-editor-sidebar', size);
    }, [state.get('sidebarSize')]);

    return types === false ? (
        <Spinner className={cx('spinner')} />
    ) : (
        <Form>
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
                            <div
                                className={cn(
                                    cx('sidebar'),
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
                                <Zone
                                    editor={state}
                                    zone={`content-editor-${region.id}`}
                                />
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
                                <Zone
                                    editor={state}
                                    zone={`content-editor-${region.id}`}
                                />
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
        minWidth={0}
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

export default ContentEditor;
