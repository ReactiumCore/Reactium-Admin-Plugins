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
 * @api {Asynchronous} Content.ACLToReadWrite() Content.ACLToReadWrite()
 * @apiDescription Takes an ACL and returns an object containing `canRead` and `canWrite`,
 both containing objectIds of roles and users that have permissiont to read or write
 the content respectively. Useful as input for `PermissionSelector` registered component.
 * @apiParam {Object} ACL serialized Parse ACL object.
 * @apiName Content.ACLToReadWrite
 * @apiGroup Reactium.Content
 */
Content.ACLToReadWrite = async ACL => {
    let aclTargets = Reactium.Cache.get('acl-targets');
    if (!aclTargets) {
        aclTargets = await Reactium.Cloud.run('acl-targets');
        Reactium.Cache.set('acl-targets', aclTargets);
    }

    const aclRoles = _.indexBy(aclTargets.roles, 'name');
    const aclUsers = _.indexBy(aclTargets.users, 'objectId');

    const response = { canRead: [], canWrite: [] };
    for (const [id, perms] of Object.entries(ACL)) {
        const read = op.get(perms, 'read', false);
        const write = op.get(perms, 'write', false);
        let objectId;
        if (id === '*') {
            objectId = op.get(aclRoles, 'anonymous.objectId');
        } else if (/^role:/.test(id)) {
            const role = id.slice(5);
            objectId = op.get(aclRoles, [role, 'objectId']);
        } else if (id in aclUsers) {
            objectId = id;
        }

        if (objectId && read) response.canRead.push(objectId);
        if (objectId && write) response.canWrite.push(objectId);
    }

    return response;
};

/**
 * @api {Asynchronous} Content.save(content,permissions) Content.save()
 * @apiDescription Create/Update content of a defined Type.
 * @apiParam {Object} content The content to create or update. Requires type and slug, but
 can contain any properties defined by content type editor.
 * @apiParam {Array} [permissions] (new content only) List of permission objects. After creation, use `Content.setPermissions()`
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

/**
 * @api {Asynchronous} Content.setPermissions(content,permissions) Content.setPermissions()
 * @apiDescription Set permissions to be used for Access Control List on existing content.
 * @apiParam {Object} content The content to create or update. Requires type and content objectId minimum.
 * @apiParam {Array} [permissions] (new content only) List of permission objects. After creation, use `Content.setPermissions()`
 * @apiParam (content) {Mixed} type Type object, or type machineName
 * @apiParam (content) {String} [objectId] The Parse objectId of the content.
 * @apiParam (content) {String} [slug] The unique slug of the content.
 * @apiParam (content) {String} [uuid] The uuid of the content.
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiParam (permission) {String} permission 'read' or 'write'
 * @apiParam (permission) {String} type 'role', 'user' or 'public'
 * @apiParam (permission) {String} [objectId] objectId of user if type='user'
 * @apiParam (permission) {String} [name] name of role if type='role'
 * @apiParam (permission) {Boolean} [allow=true] true to allow permission, false to remove permission
 * @apiName Content.setPermissions
 * @apiGroup Reactium.Content
 */
Content.setPermissions = async (content = {}, permissions = []) => {
    const request = {
        ...content,
    };

    request.type = setType(content.type);
    const ACL = await Reactium.Cloud.run('content-permissions', request);
    const { canRead = [], canWrite = [] } = await Content.ACLToReadWrite(ACL);
    const response = { ...content, ACL, canRead, canWrite };

    await Reactium.Hook.run('content-permissions-set', response);
    return response;
};

Reactium.Hook.register('content-saved', async contentObj => {
    const { canRead = [], canWrite = [] } = await Content.ACLToReadWrite(
        contentObj.ACL,
    );
    contentObj.canRead = canRead;
    contentObj.canWrite = canWrite;
});

export default Content;
