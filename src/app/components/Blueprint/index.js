import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';
import { Plugins } from 'reactium-core/components/Plugable';
import { useSelect, useStore, useCapabilityCheck } from 'reactium-core/sdk';

const ENUMS = {};

const blueprintSelect = {
    select: state =>
        op.get(
            state,
            [
                'Blueprint',
                'routesConfig',
                op.get(state, 'Router.match.path', '/'),
            ],
            '',
        ),
    shouldUpdate: ({ newState, prevState }) =>
        newState.blueprint !== prevState.blueprint,
};

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

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Blueprint
 * -----------------------------------------------------------------------------
 */
const Blueprint = () => {
    const { getState } = useStore();

    const { defaultBlueprint } = getState().Blueprint;

    const { blueprint: blueprintId, capabilities = [] } =
        useSelect(blueprintSelect) || {};

    const allowed = useCapabilityCheck(capabilities);

    const blueprint = op.get(
        getState(),
        ['Blueprint', 'blueprints', blueprintId],
        defaultBlueprint,
    );

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
        <main className={cx(blueprintMeta, cname('blueprint', blueprintId))}>
            {Object.entries(sections).map(([name, value]) => (
                <section
                    key={name}
                    className={cx(
                        op.get(value, 'meta', {}),
                        cname('section', name),
                    )}>
                    {op.get(value, 'zones', []).map(zone => (
                        <div key={zone} className={cname('zone', zone)}>
                            <Plugins
                                blueprint={blueprint}
                                zone={zone}
                                zones={zones()}
                                section={name}
                                sections={Object.keys(sections)}
                                meta={{
                                    blueprint: blueprintMeta,
                                    zone: zoneMeta(value),
                                }}
                            />
                        </div>
                    ))}
                </section>
            ))}
        </main>
    );

    if (!allowed) return null;

    // Render
    return render();
};

Blueprint.ENUMS = ENUMS;

export { Blueprint as default };
