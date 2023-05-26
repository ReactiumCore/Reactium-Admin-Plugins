import _ from 'underscore';
import op from 'object-path';
import { __ } from '@atomic-reactor/reactium-core/sdk';

const enums = {
    capabilities: ({ collection, ctRef, machineName, type }) => {
        if (!collection || !ctRef.current || !machineName || !type) return;

        return [
            {
                capability: `${collection}.create`.toLowerCase(),
                title: __('%type: Create content').replace('%type', type),
                tooltip: __(
                    'Able to create content of type %type (%machineName)',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.retrieve`.toLowerCase(),
                title: __('%type: Retrieve content').replace('%type', type),
                tooltip: __(
                    'Able to retrieve content of type %type (%machineName), if content ACL permits.',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.update`.toLowerCase(),
                title: __('%type: Update content').replace('%type', type),
                tooltip: __(
                    'Able to update any content of type %type (%machineName), if content ACL permits.',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.delete`.toLowerCase(),
                title: __('%type: Delete content').replace('%type', type),
                tooltip: __(
                    'Able to delete content of type %type (%machineName), if content ACL permits.',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.retrieveany`.toLowerCase(),
                title: __('%type: Retrieve any content (Caution)').replace(
                    '%type',
                    type,
                ),
                tooltip: __(
                    'Able to retrieve any content of type %type (%machineName), even if not owned by user.',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.updateany`.toLowerCase(),
                title: __('%type: Update any content (Caution)').replace(
                    '%type',
                    type,
                ),
                tooltip: __(
                    'Able to update any content of type %type (%machineName), even if not owned by user.',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.deleteany`.toLowerCase(),
                title: __('%type: Delete any content (Caution)').replace(
                    '%type',
                    type,
                ),
                tooltip: __(
                    'Able to delete any content of type %type (%machineName), even if not owned by user.',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.publish`.toLowerCase(),
                title: __('%type: Publish Content').replace('%type', type),
                tooltip: __(
                    'Able to publish content of type %type (%machineName.)',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.unpublish`.toLowerCase(),
                title: __('%type: Unpublish Content').replace('%type', type),
                tooltip: __(
                    'Able to unpublish content of type %type (%machineName.)',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
        ];
    },
};

export default enums;
