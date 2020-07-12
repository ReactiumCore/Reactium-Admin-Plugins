import _ from 'underscore';
import ENUMS from './enums';
import op from 'object-path';
import React, { useEffect, useState } from 'react';
import Reactium, { useAsyncEffect, useHookComponent } from 'reactium-core/sdk';

const CTCapabilityEditor = props => {
    const CapabilityEditor = useHookComponent('CapabilityEditor');

    const [defaultCapabilities, setDefaults] = useState(
        ENUMS.capabilities(props),
    );

    const { useCapabilitySettings } = Reactium;
    const [capabilities] = useCapabilitySettings(
        `content-type-${op.get(props, 'type')}`,
        defaultCapabilities,
    );

    useAsyncEffect(
        async isMounted => {
            if (!props.type) return;

            const caps = ENUMS.capabilities(props);
            const { type, collection, machineName, ctRef } = props;

            await Reactium.Hook.run(
                'content-type-capabilities',
                caps,
                type,
                collection,
                machineName,
                ctRef.current,
            );

            if (!isMounted()) return;

            setDefaults(caps);
        },
        [props.type],
    );

    return (
        <div className='admin-content-region admin-content-region-type'>
            {capabilities && capabilities.length > 0 && (
                <CapabilityEditor capabilities={capabilities} />
            )}
        </div>
    );
};

export default CTCapabilityEditor;
