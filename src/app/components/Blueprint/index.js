import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Parse from 'appdir/api';
import Reactium from 'reactium-core/sdk';
import { useSelect, useStore } from 'reactium-core/easy-connect';
import { Plugins } from 'reactium-core/components/Plugable';

const ENUMS = {};

const blueprintSelect = {
    select: state => {
        const { Blueprint, Router } = state;

        const pathname = op.get(Router, 'match.path', '/');
        const blueprintId = op.get(
            Blueprint,
            ['routesConfig', pathname, 'blueprint'],
            '',
        );

        return blueprintId;
    },
    shouldUpdate: ({ newState, prevState }) => newState !== prevState,
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Blueprint
 * -----------------------------------------------------------------------------
 */
const Blueprint = () => {
    const { getState } = useStore();

    const blueprintId = useSelect(blueprintSelect);

    const blueprint = op.get(getState(), [
        'Blueprint',
        'blueprints',
        blueprintId,
    ]);

    const blueprintMeta = op.get(blueprint, 'meta', {});
    const sections = op.get(blueprint, 'sections', {});

    // Renderer
    const render = () => (
        <main
            className={cn(
                'blueprint',
                `blueprint-${blueprintId.toLowerCase()}`,
            )}>
            {Object.entries(sections).map(([name, value]) => {
                const zones = op.get(value, 'zones', []);
                const zoneMeta = op.get(value, 'meta', {});

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

    // Render
    return render();
};

Blueprint.ENUMS = ENUMS;

export { Blueprint as default };
