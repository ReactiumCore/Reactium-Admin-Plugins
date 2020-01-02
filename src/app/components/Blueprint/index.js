import React, { useEffect, useRef, useState } from 'react';
import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Reactium, { Zone } from 'reactium-core/sdk';
import { useCapabilityCheck } from 'reactium-core/sdk';

const ENUMS = {};

const cname = (prefix, name) =>
    cn(prefix, `${prefix}-${String(name).toLowerCase()}`);

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
        op.set(blueprintConfig, 'context', context);

        if (op.has(blueprintConfig, 'update')) {
            blueprintConfig.update();
        }
    },
    Reactium.Enums.priority.lowest,
);

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Blueprint
 * -----------------------------------------------------------------------------
 */
const Blueprint = () => {
    const [version, setVersion] = useState(uuid());
    const bpParams = op.get(blueprintConfig, 'context.params.0', {});
    const {
        params,
        search,
        blueprint,
        route: routeObj = {},
        config,
        capabilities = [],
    } = bpParams;
    const { component, load, ...route } = routeObj;
    const data = op.get(blueprintConfig, 'context.data', {});

    const allowed = useCapabilityCheck(capabilities);

    // Blueprint is a top-level component, so we'll treat module as singleton
    useEffect(() => {
        op.set(blueprintConfig, 'update', () => setVersion(uuid()));
        return () => op.del(blueprintConfig, 'update');
    }, []);

    const blueprintMeta = op.get(blueprint, 'meta', {});
    const sections = op.get(blueprint, 'sections', {});
    const zoneMeta = value => op.get(value, 'meta', []);
    const zones = () =>
        _.chain(Object.values(sections))
            .pluck('zones')
            .flatten()
            .value();

    // Renderer
    const render = () => (
        <main
            className={cx(
                blueprintMeta,
                cname('blueprint', op.get(blueprint, 'ID')),
            )}>
            {Object.entries(sections).map(([name, value]) => (
                <section
                    key={name}
                    className={cx(
                        op.get(value, 'meta', {}),
                        cname('section', name),
                    )}>
                    {op.get(value, 'zones', []).map(zone => (
                        <div key={zone} className={cname('zone', zone)}>
                            <Zone
                                route={route}
                                params={params}
                                search={search}
                                zone={zone}
                                zones={zones()}
                                section={name}
                                sections={Object.keys(sections)}
                                meta={{
                                    blueprint: blueprintMeta,
                                    zone: zoneMeta(value),
                                }}
                                {...data}
                            />
                        </div>
                    ))}
                </section>
            ))}
        </main>
    );

    if (!blueprint || !allowed) return null;

    // Render
    return render();
};

Blueprint.ENUMS = ENUMS;

export { Blueprint as default };
