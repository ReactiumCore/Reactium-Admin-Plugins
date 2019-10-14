import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React from 'react';
import { useSelect } from 'reactium-core/easy-connect';
import { Plugins } from 'reactium-core/components/Plugable';

const ENUMS = {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Blueprint
 * -----------------------------------------------------------------------------
 */
const Blueprint = () => {
    const pathname = useSelect(state => op.get(state, 'Router.pathname', '/'));
    const blueprintId = useSelect(
        state =>
            op.get(state, ['Blueprint', 'routesConfig', pathname, 'blueprint']),
        '',
    );
    const blueprint = useSelect(state =>
        op.get(state, ['Blueprint', 'blueprints', blueprintId]),
    );
    const blueprintMeta = op.get(blueprint, 'meta', {});
    const sections = op.get(blueprint, 'sections', {});

    // Renderer
    const render = () => {
        return (
            <main
                className={cn(
                    'blueprint',
                    `blueprint-${blueprintId.toLowerCase()}`,
                )}>
                {Object.entries(sections).map(([name, value]) => {
                    const zones = op.get(value, 'zones', []);
                    const zoneMeta = op.get(value, 'meta', []);
                    return (
                        <section
                            key={name}
                            className={cn(
                                'section',
                                `section-${name.toLowerCase()}`,
                            )}>
                            {zones.map(zone => (
                                <div
                                    key={zone}
                                    className={cn(
                                        'zone',
                                        `zone-${zone.toLowerCase()}`,
                                    )}>
                                    <Plugins
                                        zone={zone}
                                        blueprintMeta={blueprintMeta}
                                        zoneMeta={zoneMeta}
                                    />
                                </div>
                            ))}
                        </section>
                    );
                })}
            </main>
        );
    };

    // Render
    return render();
};

Blueprint.ENUMS = ENUMS;

export { Blueprint as default };
