import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';

import Reactium, { useHookComponent, Zone } from 'reactium-core/sdk';
import React, { useEffect, useLayoutEffect as useWindowEffect } from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const cname = (prefix, name, ...className) =>
    cn(prefix, `${prefix}-${String(name).toLowerCase()}`, ...className);

const zoneName = zone =>
    typeof zone === 'string' ? zone : op.get(zone, 'zone');

const cx = (meta, extended) => {
    const { className, namespace } = meta;

    return cn({
        [className]: !!className,
        [namespace]: !!namespace,
        [extended]: !!extended,
    });
};

const blueprintConfig = {};
Reactium.Hook.register(
    'blueprint-load',
    async (params, context) => {
        Object.entries(params).forEach(([key, value]) =>
            op.set(context, key, value),
        );
        op.set(blueprintConfig, 'context', context);

        if (op.has(blueprintConfig, 'update')) {
            blueprintConfig.update();
        }
    },
    Reactium.Enums.priority.lowest,
);

const defaultWrapper = props => <section {...props} />;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Blueprint
 * -----------------------------------------------------------------------------
 */
const Blueprint = props => {
    const {
        active, // The active routing state (might be actually the previous pathname / component)
        params, // route params
        search, // route URL params as object
        transitionState, // e.g. EXITING, LOADING, ENTERING, READY
        transitionStates = [], // Upcoming state changes if Reactium.Routing.nextState() is called
    } = props;

    // TODO: scheme for blueprint zones to handle there own transition states instead of doing here
    useEffect(() => {
        if (transitionState !== 'LOADING' && transitionStates.length > 0) {
            Reactium.Routing.nextState();
        }
    }, [transitionState]);

    const route = op.get(active, 'match.route');

    const ZoneLoading = useHookComponent('ZoneLoading');

    const blueprint = op.get(route, 'blueprint');
    const settings =
        typeof window !== 'undefined' ? window.settings : global.settings;

    const blueprintMeta = op.get(blueprint, 'meta', {});
    const sections = op.get(blueprint, 'sections', {});
    const zoneMeta = value => op.get(value, 'meta', []);
    const allZones = () =>
        _.chain(Object.values(sections))
            .pluck('zones')
            .flatten()
            .value();

    const metaToDataAttributes = meta => {
        return Object.keys(meta).reduce((data, key) => {
            const dataKey = `data-${String(key).toLowerCase()}`;
            data[dataKey] = op.get(meta, key);
            return data;
        }, {});
    };

    useLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        const body = _.first(document.getElementsByTagName('BODY'));
        const html = _.first(document.getElementsByTagName('HTML'));
        if (!body) return;

        const namespace = op.get(blueprint, 'meta.namespace', 'site-page');
        const theme = op.get(settings, 'theme');

        if (namespace) body.setAttribute('data-namespace', namespace);
        if (theme) html.setAttribute('data-theme', theme);
    }, []);

    useLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        const preloader = document.getElementById('site-preloader');
        if (!preloader) return;

        preloader.remove();
    }, []);

    const blueprintProps = {
        route,
        params,
        search,
        routeProps: props,
        settings,
    };

    // Renderer
    return (
        <main
            className={cx(
                blueprintMeta,
                cname('blueprint', op.get(blueprint, 'ID')),
            )}>
            {Object.entries(sections).map(([name, value]) => {
                const className = op.get(value, 'meta.className');
                op.del(value, 'meta.className');

                const zones = op.get(value, 'zones', []);
                const Wrap = op.get(value, 'wrapper', defaultWrapper);
                const wrapAttr = metaToDataAttributes(
                    op.get(value, 'meta', {}),
                );

                const refresh = op.get(value, 'meta.refresh', false) === true;
                const loading = refresh && transitionState !== 'READY';

                return (
                    <Wrap
                        key={name}
                        className={cname('section', name, className, {
                            loading,
                        })}
                        {...wrapAttr}>
                        {zones.map(zone => {
                            const meta = op.get(zone, 'meta', {});
                            zone = zoneName(zone);
                            if (!zone) return null;

                            const zoneProps = {
                                ...blueprintProps,
                                zone: zone,
                                zones: allZones(),
                                section: name,
                                sections: Object.keys(sections),
                                meta: {
                                    blueprint: blueprintMeta,
                                    zone: zoneMeta(value),
                                },
                            };

                            return (
                                <div
                                    key={zone}
                                    className={cname('zone', zone)}
                                    {...metaToDataAttributes(meta)}>
                                    {loading ? (
                                        <ZoneLoading {...zoneProps} />
                                    ) : (
                                        <Zone {...zoneProps} />
                                    )}
                                </div>
                            );
                        })}
                    </Wrap>
                );
            })}
        </main>
    );
};

export { Blueprint as default };
