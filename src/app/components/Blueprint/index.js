import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Parse from 'appdir/api';
import { useSelect } from 'reactium-core/easy-connect';
import { Plugins } from 'reactium-core/components/Plugable';

const ENUMS = {};

const routerSelect = {
    select: state => op.get(state, 'Router', {}),
    shouldUpdate: ({ newState, prevState }) => {
        const newPath = op.get(newState, 'pathname', '/');
        const prevPath = op.get(prevState, 'pathname', '/');
        const newSearch = op.get(newState, 'search', '');
        const prevSearch = op.get(prevState, 'search', '');
        if (newPath !== prevPath) return true;
        if (newSearch !== prevSearch) return true;
        return false;
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Blueprint
 * -----------------------------------------------------------------------------
 */
const Blueprint = () => {
    const Router = useSelect(routerSelect);
    const pathname = op.get(Router, 'match.path', '/');

    const blueprintId = useSelect(state =>
        op.get(state, ['Blueprint', 'routesConfig', pathname, 'blueprint'], ''),
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
                                        section={name}
                                        Router={Router}
                                        user={Parse.User.current()}
                                        {...blueprintMeta}
                                        {...zoneMeta}
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
