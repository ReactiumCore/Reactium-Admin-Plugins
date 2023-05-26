import _ from 'underscore';
import ENUMS from './enums';
import slugify from 'slugify';
import { useEffect, useState } from 'react';

import Reactium, {
    useAsyncEffect,
    useStatus,
} from '@atomic-reactor/reactium-core/sdk';

export default (id = 'app-settings', defaultCapabilities = [], deps) => {
    const dependencies = Array.isArray(deps) ? deps : [defaultCapabilities];
    const [capabilities, setCapabilities] = useState(defaultCapabilities);
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    const getCapabilities = async () => {
        // auto register capabilities from appSettingProps.capabilities so they can be unregistered
        _.flatten([capabilities, defaultCapabilities]).forEach((item) =>
            Reactium.Capability.Settings.register(
                slugify(item.capability, { lower: true }),
                { ...item, zone: id },
                100,
            ),
        );

        const hookedCapabilities = [];

        // get hooked beotch
        Reactium.Hook.runSync(`${id}-capabilities`, hookedCapabilities);
        await Reactium.Hook.run(`${id}-capabilities`, hookedCapabilities);

        // auto register capabilities from hooks so they can be unregistered
        hookedCapabilities.forEach((item) =>
            Reactium.Capability.Settings.register(
                slugify(item.capability, { lower: true }),
                { ...item, zone: id },
                1000,
            ),
        );

        // filter out any capabilities that don't match the current zone
        return Reactium.Capability.Settings.list.filter(({ zone }) =>
            !zone ? true : _.flatten([zone]).includes(id),
        );
    };

    useEffect(() => {
        setStatus(ENUMS.STATUS.INIT, true);
    }, dependencies);

    useEffect(() => {
        if (isStatus(ENUMS.STATUS.LOADED)) {
            setStatus(ENUMS.STATUS.READY, true);
            return;
        }
    }, [status]);

    useAsyncEffect(
        async (isMounted) => {
            if (!isStatus(ENUMS.STATUS.INIT)) return;
            setStatus(ENUMS.STATUS.LOADING);
            const newCapabilities = await getCapabilities();
            if (!isMounted()) return;
            setStatus(ENUMS.STATUS.LOADED);
            setCapabilities(newCapabilities);
        },
        [isStatus(ENUMS.STATUS.INIT)],
    );

    return [
        isStatus(ENUMS.STATUS.READY) ? capabilities : null,
        setCapabilities,
    ];
};

/**
 * @api {ReactHook} useCapabilitySettings(id,defaultCapabilities) useCapabilitySettings()
 * @apiVersion 3.2.1
 * @apiName useCapabilitySettings
 * @apiGroup ReactHook
 * @apiDescription React hook that async combines capability settings from a Reactium hook based on the zone parameter and the Registry Object zone value.

Returns the capabilities array and a setter function.

 * @apiParam {String} zone The Capability Setting zone. The zone value will be appended with `-capabilities` to create a Reactium async/sync hook.
 * @apiParam {Array} [defaultCapabilities] Array of Capability Setting objects that will be auto registered.
 * @apiParam {Array} [dependencies] Array of values that will cause a reload of the capabilities. Default: `[defaultCapabilities]`
 * @apiExample Example
import React from 'react';
import Reactium from '@atomic-reactor/reactium-core/sdk';

const CapabilityList = ({ zone = 'my-zone' }) => {
    // Run the 'my-zone-capabilities' hook which allows plugins to auto register a Regsitry Object.
    const { useCapabilitySettings } = Reactium;
    const [capabilities] = useCapabilitySettings(zone);

    // Render a list
    return (
        <ul>
            {capabilities.map(({ capability, title, tooltip }) => (
                <li key={capability} data-tooltip={tooltip}>
                    {capability} - {title}
                </li>
            ))}
        </ul>
    );
};
*/
