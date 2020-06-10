import _ from 'underscore';
import op from 'object-path';
import Actinium from 'appdir/api';
import Reactium from 'reactium-core/sdk';

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
    { key: 'exists', value: 'taxonomy-exists' },
    { key: 'list', value: 'taxonomies' },
    { key: 'Type.create', value: 'taxonomy-type-create' },
    { key: 'Type.update', value: 'taxonomy-type-update' },
    { key: 'Type.delete', value: 'taxonomy-type-delete' },
    { key: 'Type.retrieve', value: 'taxonomy-type-retrieve' },
    { key: 'Type.exists', value: 'taxonomy-type-exists' },
    { key: 'Type.list', value: 'taxonomy-types' },
    { key: 'Content.attach', value: 'taxonomy-content-attach' },
    { key: 'Content.detach', value: 'taxonomy-content-detach' },
    { key: 'Content.retrieve', value: 'taxonomy-content-retrieve' },
];
// prettier-ignore
functions.forEach(({ key, value }) => op.set(Taxonomy, key, params => Actinium.Cloud.run(value, params)));

Taxonomy.Type.list = async params => {
    const cached = Reactium.Cache.get('taxonomy.types');
    if (cached && !op.has(params, 'refresh')) return cached;

    const results = await Actinium.Cloud.run('taxonomy-types', params);

    Reactium.Cache.set('taxonomy.types', results, 10000);
    return results;
};

Taxonomy.Type.retrieve = async params => {
    const cacheID = `taxonomy.type.${op.get(params, 'slug')}`;

    const cached = Reactium.Cache.get(cacheID);
    if (cached) return cached;

    const results = await Actinium.Cloud.run('taxonomy-type-retrieve', params);

    Reactium.Cache.set(cacheID, results, 10000);
    return results;
};

export default Taxonomy;
