import Reactium from 'reactium-core/sdk';
import op from 'object-path';

Reactium.Enums.cache.types = 10000;

const ContentType = {};

ContentType.types = async (refresh = false) => {
    let request = Reactium.Cache.get('content-types');

    if (request) return request;

    request = Reactium.Cloud.run('types', { refresh }).then(response => {
        return op.get(response, 'types', []);
    });

    Reactium.Cache.set('content-types', request, Reactium.Enums.cache.types);
    return request;
};

ContentType.save = async (id, type = {}) => {
    if (id === 'new') return Reactium.Cloud.run('type-create', type);
    const response = await Reactium.Cloud.run('type-update', {
        uuid: id,
        ...type,
    });

    Reactium.Cache.del('content-types');
    return response;
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
    const response = await Reactium.Cloud.run('type-delete', {
        uuid: id,
    });
    Reactium.Cache.del('content-types');

    return response;
};

export default ContentType;
