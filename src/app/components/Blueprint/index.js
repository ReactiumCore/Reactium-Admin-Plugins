import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';
import { Plugins } from 'reactium-core/components/Plugable';
import { useSelect, useStore } from 'reactium-core/easy-connect';

const ENUMS = {};

const blueprintSelect = {
    select: state =>
        op.get(
            state,
            [
                'Blueprint',
                'routesConfig',
                op.get(state, 'Router.match.path', '/'),
                'blueprint',
            ],
            '',
        ),
    shouldUpdate: ({ newState, prevState }) => newState !== prevState,
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Blueprint
 * -----------------------------------------------------------------------------
 */
const Blueprint = () => {
    const { getState } = useStore();

    const { defaultBlueprint } = getState().Blueprint;

    const blueprintId = useSelect(blueprintSelect);

    const blueprint = op.get(
        getState(),
        ['Blueprint', 'blueprints', blueprintId],
        defaultBlueprint,
    );

    const blueprintMeta = op.get(blueprint, 'meta', {});

    const cname = (prefix, name) =>
        cn(prefix, `${prefix}-${String(name).toLowerCase()}`);

    const sections = op.get(blueprint, 'sections', {});

    const zoneMeta = value => op.get(value, 'meta', []);

    // Renderer
    const render = () => (
        <main className={cname('blueprint', blueprintId)}>
            {Object.entries(sections).map(([name, value]) => (
                <section key={name} className={cname('section', name)}>
                    {op.get(value, 'zones', []).map(zone => (
                        <div key={zone} className={cname('zone', zone)}>
                            <Plugins
                                zone={zone}
                                section={name}
                                {...blueprintMeta}
                                {...zoneMeta(value)}
                            />
                        </div>
                    ))}
                </section>
            ))}
        </main>
    );

    // Render
    return render();
};

Blueprint.ENUMS = ENUMS;

export { Blueprint as default };
