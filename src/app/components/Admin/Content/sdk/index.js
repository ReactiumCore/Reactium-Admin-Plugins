import Reactium, { __ } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';

const setType = typeParam => {
    const type = {};
    if (typeof typeParam === 'string') {
        type.machineName = typeParam;
    } else if (typeof typeParam === 'object') {
        if (op.has(typeParam, 'objectId')) type.objectId = typeParam.objectId;
        if (op.has(typeParam, 'machineName'))
            type.machineName = typeParam.machineName;
        if (op.has(typeParam, 'uuid')) type.uuid = typeParam.uuid;
    }

    if (!Object.keys(type).length) throw __('Invalid type.');

    return type;
};

const Content = {};

/**
 * @api {Asynchronous} Content.save(content,permissions) Content.save()
 * @apiDescription Create/Update content of a defined Type.
 * @apiParam {Object} content The content to create or update. Requires type and slug, but
 can contain any properties defined by content type editor.
 * @apiParam {Array} [permissions] (new content only) List of permission objects. After creation, use `Content.setPermission()`
 * @apiParam (content) {Mixed} type Type object, or type machineName
 * @apiParam (content) {String} slug The unique slug for the new content.
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiParam (permission) {String} permission 'read' or 'write'
 * @apiParam (permission) {String} type 'role', 'user' or 'public'
 * @apiParam (permission) {String} [objectId] objectId of user if type='user'
 * @apiParam (permission) {String} [name] name of role if type='role'
 * @apiParam (permission) {Boolean} [allow=true] true to allow permission, false to remove permission
 * @apiName Content.save
 * @apiGroup Reactium.Content
 */
Content.save = async (content = {}, permissions = []) => {
    const request = {
        ...content,
    };

    request.type = setType(content.type);

    let saveFunction = 'content-update';
    if (!op.has(content, 'objectId')) {
        saveFunction = 'content-create';
        request.permissions = permissions;
    }

    const contentObj = await Reactium.Cloud.run(saveFunction, request);
    await Reactium.Hook.run('content-saved', contentObj);
    return contentObj;
};

export default Content;
