import Reactium from 'reactium-core/sdk';
import op from 'object-path';

Reactium.Enums.cache.types = 10000;

const ContentType = { FieldType: {} };

/**
 * @api {Function} ContentType.types() ContentType.types()
 * @apiDescription Get list of content types with the type name, uuid, and label from Actinium
 * @apiName ContentType.types
 * @apiGroup Reactium.ContentType
 * @apiParam {Boolean} refresh Retrieve a fresh list of ContentType objects.
 * @apiParam {Boolean} schema Include the Collection schema object.
 */
ContentType.types = async (params = {}, debug) => {
    const refresh = op.get(params, 'refresh');

    if (debug) console.log('ContentType.types', refresh, debug);

    let request = refresh !== true && Reactium.Cache.get('content-types');

    if (request) return request;

    request = Reactium.Cloud.run('types', params).then(response => {
        return op.get(response, 'types', []);
    });

    Reactium.Cache.set(
        'content-types',
        request,
        Reactium.Enums.cache.types,
        () => {
            if (debug) console.log('content-types cache delete');
        },
    );

    return request;
};

/**
 * @api {Function} ContentType.save(id,type) ContentType.save()
 * @apiDescription Save a content type definition.
 * @apiParam {String} id 'new' or the uuid of the type.
 * @apiParam {Object} type object containing the `type` label, `fields` object, `regions` object, and `meta` object for a content type.
 * @apiParam type {String} type unique label of content type. On initial save, this will be used to generate the machineName and label of the type. On subsequent
 updates, only the label will be modified, and the machineName will remain the same.
 * @apiParam type {Object} regions indexed by region id, this object contains multiple region objects,
 each with the same id ('default' by default), a label, and a slug. Each field
 in the `fields` has a `region` property with the id of the region to which it belongs.
 * @apiParam type {Object} fields indexed by fieldId (an uuid), this object contains 1 or more objects that describe
 the configuration for one "field type" in the content type. The only required properties in each object are
 `fieldId`, which matches the index, a string `fieldType` which identifies a supported
 Actinium field type, a string `region`id ("default" region id by default), and
 a unique `fieldName` which will ultimately be the name of the field in the content schema.
 * @apiParam type {Object} [meta] largely free-form metadata object associated with this content type.
 Actinium will use this to store the current label of the type.
 * @apiName ContentType.save
 * @apiGroup Reactium.ContentType
 */
ContentType.save = async (id, type = {}) => {
    if (id === 'new') return Reactium.Cloud.run('type-create', type);
    const response = await Reactium.Cloud.run('type-update', {
        uuid: id,
        ...type,
    });

    Reactium.Cache.del('content-types');
    Reactium.Cache.del('contentTypeRetrieve');
    return response;
};

/**
 * @api {Function} ContentType.retrieve(options) ContentType.retrieve()
 * @apiDescription Retrieve configuration for one content type. You must provide either the uuid or the machineName.
 * @apiParam {Mixed} options string uuid or Object containing
 * @apiParam (options) {String} [uuid] UUID of content type
 * @apiParam (options) {String} [machineName] the machine name of the existing content type
 * @apiParam (options) {String} [namespace] optional namespace. Will be used to derive the uuid from the machine name if
 the uuid is not known. By default, the current APIs content namespace will be used, and this will not be needed.
 * @apiName ContentType.retrieve
 * @apiGroup Reactium.ContentType
 */
ContentType.retrieve = async options => {
    let requestOptions = {};

    if (typeof options === 'string') requestOptions.uuid = options;
    if (typeof options === 'object') requestOptions = options;

    const { refresh } = requestOptions;
    const cacheKey = `contentTypeRetrieve.${btoa(requestOptions)}`;

    if (refresh === true) Reactium.Cache.del(cacheKey);

    const cached = Reactium.Cache.get(cacheKey);
    if (cached) return cached;

    const contentType = await Reactium.Cloud.run(
        'type-retrieve',
        requestOptions,
    );

    const response = {
        ...contentType,
        fields: op.get(contentType, 'fields', {}),
    };

    Reactium.Cache.set(cacheKey, response, 30000);

    return response;
};

/**
 * @api {Function} ContentType.delete(options) ContentType.delete()
 * @apiDescription Delete a content type configuration. Note that this will not delete the content or its schema,
 only the content type configuration.
 * @apiParam {Mixed} options string uuid or Object containing
 * @apiParam (options) {String} [uuid] UUID of content type
 * @apiParam (options) {String} [machineName] the machine name of the existing content type
 * @apiParam (options) {String} [namespace] optional namespace. Will be used to derive the uuid from the machine name if
 the uuid is not known. By default, the current APIs content namespace will be used, and this will not be needed.
 * @apiName ContentType.delete
 * @apiGroup Reactium.ContentType
 */
ContentType.delete = async options => {
    let requestOptions = {};

    if (typeof options === 'string') requestOptions.uuid = options;
    if (typeof options === 'object') requestOptions = options;

    const response = await Reactium.Cloud.run('type-delete', requestOptions);

    Reactium.Cache.del('content-types');
    Reactium.Cache.del('contentTypeRetrieve');
    return response;
};

ContentType.FieldType = Reactium.Utils.registryFactory('FieldType', 'type');

export default ContentType;
