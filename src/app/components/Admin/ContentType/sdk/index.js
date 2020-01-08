import Reactium from 'reactium-core/sdk';
import op from 'object-path';

const ContentType = {};

ContentType.types = async (refresh = false) => {
    let types = Reactium.Cache.get('content-types');
    if (!refresh && types) return types;
    const response = await Reactium.Cloud.run('types');

    types = op.get(response, 'types', []);

    Reactium.Cache.set('content-types', types, Reactium.Enums.cache.settings);
    return types;
};

ContentType.save = async (id, type = {}) => {
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
    return Reactium.Cloud.run('type-delete', {
        uuid: id,
    });
};

export default ContentType;
