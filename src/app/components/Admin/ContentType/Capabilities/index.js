import React, { useState } from 'react';
import Reactium, {
    __,
    useHookComponent,
    useAsyncEffect,
} from 'reactium-core/sdk';

const CTCapabilityEditor = props => {
    const { type, collection, machineName, ctValue } = props;
    const CapabilityEditor = useHookComponent('CapabilityEditor');
    const [capabilities, update] = useState([]);

    useAsyncEffect(
        async isMounted => {
            if (!type) return;

            // set new capRef.current to update CT cap list
            const context = await Reactium.Hook.run(
                'content-type-capabilities',
                [
                    {
                        capability: `${collection}.create`,
                        title: __('%type: Create content').replace(
                            '%type',
                            type,
                        ),
                        tooltip: __(
                            'Able to create content of type %type (%machineName)',
                        )
                            .replace('%type', type)
                            .replace('%machineName', machineName),
                    },
                    {
                        capability: `${collection}.retrieve`,
                        title: __('%type: Retrieve content').replace(
                            '%type',
                            type,
                        ),
                        tooltip: __(
                            'Able to retrieve content of type %type (%machineName), if content ACL permits.',
                        )
                            .replace('%type', type)
                            .replace('%machineName', machineName),
                    },
                    {
                        capability: `${collection}.update`,
                        title: __('%type: Update content').replace(
                            '%type',
                            type,
                        ),
                        tooltip: __(
                            'Able to update any content of type %type (%machineName), if content ACL permits.',
                        )
                            .replace('%type', type)
                            .replace('%machineName', machineName),
                    },
                    {
                        capability: `${collection}.delete`,
                        title: __('%type: Delete content').replace(
                            '%type',
                            type,
                        ),
                        tooltip: __(
                            'Able to delete content of type %type (%machineName), if content ACL permits.',
                        )
                            .replace('%type', type)
                            .replace('%machineName', machineName),
                    },
                    {
                        capability: `${collection}.retrieveAny`,
                        title: __(
                            '%type: Retrieve any content (Caution)',
                        ).replace('%type', type),
                        tooltip: __(
                            'Able to retrieve any content of type %type (%machineName), even if not owned by user.',
                        )
                            .replace('%type', type)
                            .replace('%machineName', machineName),
                    },
                    {
                        capability: `${collection}.updateAny`,
                        title: __(
                            '%type: Update any content (Caution)',
                        ).replace('%type', type),
                        tooltip: __(
                            'Able to update any content of type %type (%machineName), even if not owned by user.',
                        )
                            .replace('%type', type)
                            .replace('%machineName', machineName),
                    },
                    {
                        capability: `${collection}.deleteAny`,
                        title: __(
                            '%type: Delete any content (Caution)',
                        ).replace('%type', type),
                        tooltip: __(
                            'Able to delete any content of type %type (%machineName), even if not owned by user.',
                        )
                            .replace('%type', type)
                            .replace('%machineName', machineName),
                    },
                    {
                        capability: `${collection}.publish`,
                        title: __('%type: Publish Content').replace(
                            '%type',
                            type,
                        ),
                        tooltip: __(
                            'Able to publish content of type %type (%machineName.)',
                        )
                            .replace('%type', type)
                            .replace('%machineName', machineName),
                    },
                    {
                        capability: `${collection}.unpublish`,
                        title: __('%type: Unpublish Content').replace(
                            '%type',
                            type,
                        ),
                        tooltip: __(
                            'Able to unpublish content of type %type (%machineName.)',
                        )
                            .replace('%type', type)
                            .replace('%machineName', machineName),
                    },
                ],
                type,
                collection,
                machineName,
                ctValue,
            );

            if (isMounted()) update(context.capabilities);
        },
        [ctValue],
    );

    return (
        <div className='admin-content-region admin-content-region-type'>
            {capabilities.length > 0 && (
                <CapabilityEditor capabilities={capabilities} />
            )}
        </div>
    );
};

export default CTCapabilityEditor;
