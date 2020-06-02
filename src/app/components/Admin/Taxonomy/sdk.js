import _ from 'underscore';
import op from 'object-path';
import Actinium from 'appdir/api';

const Taxonomy = {
    Content: {},
    Type: {},
};

// Passthrough to cloud functions
const functions = [
    { key: 'create', value: 'taxonomy-create' },
    { key: 'update', value: 'taxonomy-update' },
    { key: 'delete', value: 'taxonomy-delete' },
    { key: 'retrieve', value: 'taxonomy-retrieve' },
    { key: 'list', value: 'taxonomies' },
    { key: 'Type.create', value: 'taxonomy-type-create' },
    { key: 'Type.update', value: 'taxonomy-type-update' },
    { key: 'Type.delete', value: 'taxonomy-type-delete' },
    { key: 'Type.retrieve', value: 'taxonomy-type-retrieve' },
    { key: 'Type.list', value: 'taxonomy-types' },
    { key: 'Content.attach', value: 'taxonomy-content-attach' },
    { key: 'Content.detach', value: 'taxonomy-content-detach' },
    { key: 'Content.retrieve', value: 'taxonomy-content-retrieve' },
];
// prettier-ignore
functions.forEach(({ key, value }) => op.set(Taxonomy, key, params => Actinium.Cloud.run(value, params)));

export default Taxonomy;
