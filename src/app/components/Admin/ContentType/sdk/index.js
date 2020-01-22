import Reactium from 'reactium-core/sdk';
import op from 'object-path';

const ContentType = {};

ContentType.types = async (refresh = false) => {
    let request = Reactium.Cache.get('content-types');
    if (request && !refresh) return request;

    request = Reactium.Cloud.run('types').then(response => {
        return op.get(response, 'types', []);
    });

    Reactium.Cache.set('content-types', request, Reactium.Enums.cache.settings);
    return request;
};

ContentType.save = async (id, type = {}) => {
    Reactium.Cache.del('content-types');
    if (id === 'new') return Reactium.Cloud.run('type-create', type);
    return Reactium.Cloud.run('type-update', {
        uuid: id,
        ...type,
    });
};

ContentType.retrieve = async id => {
    const contentType = await Reactium.Cloud.run('type-retrieve', {
        uuid: id,
    });

    return {
        ...contentType,
        fields: op.get(contentType, 'fields', {}),
    };
};

ContentType.delete = async id => {
    Reactium.Cache.del('content-types');
    return Reactium.Cloud.run('type-delete', {
        uuid: id,
    });
};

export default ContentType;
