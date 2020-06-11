import Reactium from 'reactium-core/sdk';
import op from 'object-path';

const functions = [
    { key: 'Client.create', value: 'syndicate-client-create' },
    { key: 'Client.retrieve', value: 'syndicate-client-retrieve' },
    { key: 'Client.list', value: 'syndicate-clients' },
    { key: 'Client.delete', value: 'syndicate-client-delete' },
];

const SDK = {};

functions.forEach(({ key, value }) =>
    op.set(SDK, key, params => Reactium.Cloud.run(value, params)),
);

export default SDK;
