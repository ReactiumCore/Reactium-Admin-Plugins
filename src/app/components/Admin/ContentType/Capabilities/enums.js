import _ from 'underscore';
import op from 'object-path';
import { __ } from 'reactium-core/sdk';

const enums = {
    capabilities: ({ collection, ctRef, machineName, type }) => {
        if (!collection || !ctRef.current || !machineName || !type) return;

        return [
            {
                capability: `${collection}.create`,
                title: __('%type: Create content').replace('%type', type),
                tooltip: __(
                    'Able to create content of type %type (%machineName)',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.retrieve`,
                title: __('%type: Retrieve content').replace('%type', type),
                tooltip: __(
                    'Able to retrieve content of type %type (%machineName), if content ACL permits.',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.update`,
                title: __('%type: Update content').replace('%type', type),
                tooltip: __(
                    'Able to update any content of type %type (%machineName), if content ACL permits.',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.delete`,
                title: __('%type: Delete content').replace('%type', type),
                tooltip: __(
                    'Able to delete content of type %type (%machineName), if content ACL permits.',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.retrieveAny`,
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
                capability: `${collection}.updateAny`,
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
                capability: `${collection}.deleteAny`,
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
                capability: `${collection}.publish`,
                title: __('%type: Publish Content').replace('%type', type),
                tooltip: __(
                    'Able to publish content of type %type (%machineName.)',
                )
                    .replace('%type', type)
                    .replace('%machineName', machineName),
            },
            {
                capability: `${collection}.unpublish`,
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
