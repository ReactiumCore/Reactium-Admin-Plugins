import Reactium, { __ } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';
import Parse from 'appdir/api';

const serialize = data => {
    if (!data || typeof data.toJSON === 'undefined') return data;

    const obj = data.toJSON();
    Object.entries(obj).forEach(([key, value]) => {
        if (value && typeof value.toJSON !== 'undefined') {
            obj[key] = value.toJSON();
        }

        // strip pointers
        if (op.has(obj, [key, '__type'])) op.del(obj, [key, '__type']);
    });

    return obj;
};

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
 * @api {Asynchronous} Content.retrieve(params) Content.retrieve()
 * @apiDescription Retrieve one item of content.
 * @apiParam {Object} params See below
 * @apiParam (params) {Mixed} type Type object, or type machineName
 * @apiParam (params) {Boolean} [current=false] When true, get the currently committed content (not from revision system).
 otherwise, construct the content from the provided history (branch and revision index).
 * @apiParam (params) {Object} [history] revision history to retrieve, containing branch and revision index.
 * @apiParam (params) {String} [slug] The unique slug for the content.
 * @apiParam (params) {String} [objectId] The objectId for the content.
 * @apiParam (params) {String} [uuid] The uuid for the content.
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiParam (history) {String} [branch=master] the revision branch of current content
 * @apiParam (history) {Number} [revision] index in branch history to retrieve
 (default index of latest revision)
 * @apiName Content.retrieve
 * @apiGroup Reactium.Content
 */
Content.retrieve = async params => {
    const request = { ...params, type: setType(params.type) };
    const contentObj = await Reactium.Cloud.run('content-retrieve', request);

    await Reactium.Hook.run('content-retrieved', contentObj, request);
    return contentObj;
};

/**
 * @api {Asynchronous} Content.setCurrent(params) Content.setCurrent()
 * @apiDescription Take content from a specified branch or revision,
 and make it the "official" version of the content. If no `history` is param is
 specified the latest master branch revision will be used.
 * @apiParam {Object} params See below
 * @apiParam (params) {Mixed} type Type object, or type machineName
 * @apiParam (params) {String} [slug] The unique slug for the content.
 * @apiParam (params) {String} [objectId] The Parse object id of the content.
 * @apiParam (params) {String} [uuid] The uuid of the content.
 * @apiParam (params) {Object} [history] revision history to retrieve, containing branch and revision index.
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiParam (history) {String} [branch=master] the revision branch of current content
 * @apiParam (history) {Number} [revision] index in branch history to update (defaults to most recent in branch).
 * @apiName Content.setCurrent
 * @apiGroup Reactium.Content
 */
Content.setCurrent = async params => {
    const request = { ...params, type: setType(params.type) };
    const contentObj = await Reactium.Cloud.run('content-set-current', request);

    await Reactium.Hook.run('content-current-set', contentObj, request);
    return contentObj;
};

/**
 * @api {Asynchronous} Content.delete(params) Content.delete()
 * @apiDescription Delete content of a defined Type. To identify the content, you must provided
the `type` object, and one of `slug`, `objectId`, or `uuid` of the content.
 * @apiParam {Object} params See below
 * @apiParam (params) {Mixed} type Type object, or type machineName
 * @apiParam (params) {String} [slug] The unique slug for the content.
 * @apiParam (params) {String} [objectId] The Parse object id of the content.
 * @apiParam (params) {String} [uuid] The uuid of the content.
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiName Content.delete
 * @apiGroup Reactium.Content
 */
Content.delete = async params => {
    const request = { ...params, type: setType(params.type) };
    const recycled = await Reactium.Cloud.run('content-delete', request);

    await Reactium.Hook.run('content-deleted', recycled, request);
    return recycled;
};

/**
 * @api {Asynchronous} Content.restore(params) Content.restore()
 * @apiDescription Restore deleted content of a defined Type (if still in recycle).
 To identify the content, you must provided the `type` object, and `objectId` of
 the content. Restores main record for content as well as any revisions.
 * @apiParam {Object} params See below
 * @apiParam (params) {Mixed} type Type object, or type machineName
 * @apiParam (params) {String} objectId The Parse object id of the deleted content.
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiName Content.restore
 * @apiGroup Reactium.Content
 */
Content.restore = async params => {
    const request = { ...params, type: setType(params.type) };
    const contentObj = await Reactium.Cloud.run('content-restore', request);

    await Reactium.Hook.run('content-restored', contentObj, request);
    return contentObj;
};

/**
 * @api {Asynchronous} Content.publish(params) Content.publish()
 * @apiDescription Set revision to current version and publish content.
 * @apiParam {Object} params See below
 * @apiParam (params) {Mixed} type Type object, or type machineName
 * @apiParam (params) {String} [slug] The unique slug for the content.
 * @apiParam (params) {String} [objectId] The Parse object id of the content.
 * @apiParam (params) {String} [uuid] The uuid of the content.
 * @apiParam (params) {Object} [history] revision history to retrieve, containing branch and revision index.
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiParam (history) {String} [branch=master] the revision branch of current content
 * @apiParam (history) {Number} [revision] index in branch history to update (defaults to most recent in branch).
 * @apiName Content.publish
 * @apiGroup Reactium.Content
 */
Content.publish = async params => {
    const request = { ...params, type: setType(params.type) };
    const contentObj = await Reactium.Cloud.run('content-publish', request);

    await Reactium.Hook.run('content-published', contentObj, request);
    return contentObj;
};

/**
 * @api {Asynchronous} Content.setStatus(params) Content.setStatus()
 * @apiDescription Set revision to current version and set the status of the content. Only used to change
status of non-published content.
 * @apiParam {Object} params See below
 * @apiParam (params) {Mixed} type Type object, or type machineName
 * @apiParam (params) {String} [slug] The unique slug for the content.
 * @apiParam (params) {String} [objectId] The Parse object id of the content.
 * @apiParam (params) {String} [uuid] The uuid of the content.
 * @apiParam (params) {Object} [history] revision history to retrieve, containing branch and revision index.
 * @apiParam (params) {String} status one of the statuses associated with the content type.
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiParam (history) {String} [branch=master] the revision branch of current content
 * @apiParam (history) {Number} [revision] index in branch history to update (defaults to most recent in branch).
 * @apiName Content.setStatus
 * @apiGroup Reactium.Content
 */
Content.setStatus = async params => {
    const request = { ...params, type: setType(params.type) };
    const contentObj = await Reactium.Cloud.run('content-set-status', request);

    await Reactium.Hook.run('content-status-set', contentObj, request);
    return contentObj;
};

/**
 * @api {Asynchronous} Content.unpublish(params) Content.unpublish()
 * @apiDescription Unpublish current version of content, and set status to `DRAFT`
 * @apiParam {Object} params See below
 * @apiParam (params) {Mixed} type Type object, or type machineName
 * @apiParam (params) {String} [slug] The unique slug for the content.
 * @apiParam (params) {String} [objectId] The Parse object id of the content.
 * @apiParam (params) {String} [uuid] The uuid of the content.
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiName Content.unpublish
 * @apiGroup Reactium.Content
 */
Content.unpublish = async params => {
    const request = { ...params, type: setType(params.type) };
    const contentObj = await Reactium.Cloud.run('content-unpublish', request);

    await Reactium.Hook.run('content-unpublished', contentObj, request);
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
        permissions,
    };

    request.type = setType(content.type);
    const ACL = await Reactium.Cloud.run('content-permissions', request);
    const { canRead = [], canWrite = [] } = await Content.ACLToReadWrite(ACL);
    const response = { ...content, ACL, canRead, canWrite };

    await Reactium.Hook.run('content-permissions-set', response);
    return response;
};

/**
 * @api {Asynchronous} Content.schedule(params) Content.schedule()
 * @apiDescription Schedule the publishing / unpublishing of content. If `history` is provided, that revision will be
 made current and published on optional `sunrise`. On optional `sunset`, the current version of the content will be unpublished.
 The requesting user must have publish and unpublish capabilities.
 * @apiParam {Object} params See below
 * @apiParam (params) {Mixed} type Type object, or type machineName
 * @apiParam (params) {String} [slug] The unique slug for the content.
 * @apiParam (params) {String} [objectId] The Parse object id of the content.
 * @apiParam (params) {String} [uuid] The uuid of the content.
 * @apiParam (params) {String} [sunrise] Optional ISO8601 + UTC Offset datetime
 string (moment.format()) for sunrise (publishing) of content. e.g. 2020-02-07T11:15:04-05:00
 * @apiParam (params) {Object} [history] revision history to sunrise, containing branch and revision index.
 * @apiParam (params) {String} [sunset] Optional ISO8601 + UTC Offset datetime
 string (moment.format()) for sunset (unpublishing) of content. e.g. 2020-02-07T11:15:04-05:00
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiParam (history) {String} [branch=master] the revision branch of current content
 * @apiParam (history) {Number} [revision] index in branch history to update (defaults to most recent in branch).
 * @apiName Content.schedule
 * @apiGroup Reactium.Content
 * @apiExample Usage
import Reactium from 'reactium-core/sdk';
import moment from 'moment';

const now = moment();

// publish version 3 of master branch a month from now
// unpublish the article in 2 months
Reactium.Content.schedule({
    // identify content type
    type: { machineName: 'article' },
    // identify content by slug (or objectId, uuid)
    slug: 'my-article',
    // identify desired revision (latest master is default)
    history: { branch: 'master', revision: 3 },

    // sunrise timestamp
    sunrise: now
        .clone()
        .add(1, 'month')
        .format(),

    // sunset timestamp
    sunset: now
        .clone()
        .add(2, 'month')
        .format(),
});
 */
Content.schedule = async params => {
    const request = { ...params, type: setType(params.type) };
    const contentObj = await Reactium.Cloud.run('content-schedule', request);

    await Reactium.Hook.run('content-scheduled', contentObj, request);
    return contentObj;
};

/**
 * @api {Asynchronous} Content.changelog(objectId,options) Content.changelog()
 * @apiDescription Get changelog for content item.
 Some of the built-in changes that are tracked:
 - CREATED: meta.history to get starting branch and revision index
 - REVISED: meta.history to get branch and revision index
 - SET_REVISION: meta.history to get branch and revision index
 - SET_ACL: meta.ACL to get what ACL was changed to
 - SET_STATUS: meta.history to get branch and revision index, meta.status to get new status
 - PUBLISHED: meta.history to get branch and revision index published
 - UNPUBLISHED
 - SCHEDULE: meta.publish to get sunrise/sunset/history scheduled
 - SCHEDULED_PUBLISH: meta.history to get branch and revision index published
 - SCHEDULED_UNPUBLISH
 - TRASH
 - RESTORE
 * @apiParam {String} contentId Parse objectId of content.
 * @apiParam {Object} [options] options to request changelog
 * @apiParam (options) {String} [direction=descending] Order "descending" or "ascending"
 * @apiParam (options) {Number} [limit=1000] Limit page results
 * @apiParam (options) {Number} [page=1] Page number
 * @apiName Content.changelog
 * @apiGroup Reactium.Content
 * @apiExample Usage:
import Reactium from 'reactium-core/sdk';

Reactium.Content.changelog('zJkUz6dD49').then(data => {
  console.log({data});
  // data: {
  //   "count": 5,
  //   "next": 2,
  //   "page": 1,
  //   "pages": 2,
  //   "prev": null,
  //   "results": [
  //     {
  //       "meta": {
  //         "ACL": {
  //           "role:administrator": {
  //             "read": true,
  //             "write": true
  //           },
  //           "role:super-admin": {
  //             "read": true,
  //             "write": true
  //           },
  //           "lL1SfyzHiE": {
  //             "read": true,
  //             "write": true
  //           }
  //         }
  //       },
  //       "contentId": "zJkUz6dD49",
  //       "collection": "Content_article",
  //       "userId": "lL1SfyzHiE",
  //       "changeType": "SET_ACL",
  //       "createdAt": "2020-02-25T21:03:16.325Z",
  //       "updatedAt": "2020-02-25T21:03:16.325Z",
  //       "objectId": "4sanIa8yLR"
  //     },
  //     {
  //       "meta": {
  //         "ACL": {
  //           "role:contributor": {
  //             "read": true
  //           },
  //           "role:administrator": {
  //             "read": true,
  //             "write": true
  //           },
  //           "role:super-admin": {
  //             "read": true,
  //             "write": true
  //           },
  //           "lL1SfyzHiE": {
  //             "read": true,
  //             "write": true
  //           }
  //         }
  //       },
  //       "contentId": "zJkUz6dD49",
  //       "collection": "Content_article",
  //       "userId": "lL1SfyzHiE",
  //       "changeType": "SET_ACL",
  //       "createdAt": "2020-02-25T21:02:50.193Z",
  //       "updatedAt": "2020-02-25T21:02:50.193Z",
  //       "objectId": "Ni2hNTdv52"
  //     },
  //     {
  //       "meta": {
  //         "ACL": {
  //           "*": {
  //             "read": true
  //           },
  //           "role:administrator": {
  //             "read": true,
  //             "write": true
  //           },
  //           "role:super-admin": {
  //             "read": true,
  //             "write": true
  //           },
  //           "lL1SfyzHiE": {
  //             "read": true,
  //             "write": true
  //           }
  //         }
  //       },
  //       "contentId": "zJkUz6dD49",
  //       "collection": "Content_article",
  //       "userId": "lL1SfyzHiE",
  //       "changeType": "SET_ACL",
  //       "createdAt": "2020-02-25T20:34:56.221Z",
  //       "updatedAt": "2020-02-25T20:34:56.221Z",
  //       "objectId": "0LZT6CMqlq"
  //     },
  //     {
  //       "meta": {
  //         "ACL": {
  //           "*": {
  //             "read": true
  //           },
  //           "role:administrator": {
  //             "read": true,
  //             "write": true
  //           },
  //           "role:super-admin": {
  //             "read": true,
  //             "write": true
  //           },
  //           "lL1SfyzHiE": {
  //             "read": true,
  //             "write": true
  //           }
  //         }
  //       },
  //       "contentId": "zJkUz6dD49",
  //       "collection": "Content_article",
  //       "userId": "lL1SfyzHiE",
  //       "changeType": "SET_ACL",
  //       "createdAt": "2020-02-25T20:32:12.611Z",
  //       "updatedAt": "2020-02-25T20:32:12.611Z",
  //       "objectId": "f1d8OaDHOk"
  //     }
  //   ]
  // }
})
 */
Content.changelog = async (contentId, options = {}) => {
    return Reactium.Cloud.run('changelog', {
        contentId,
        ...options,
    });
};

/**
 * @api {Async} Content.changelogSubscribe(contentId,advancedQuery) Content.changelogSubscribe()
 * @apiDescription Subscribe to content changelog.
 * @apiParam {String} [contentId] the objectId of the content, by default all changes for
all content will be subscribed. Promise resolves to unsubscribe callback.
 * @apiParam {Array} [advancedQuery] list of query operations and parameters
 * @apiParam (advancedQueryItem) {String} operation method of Parse.Query to include in query. e.g. 'equalTo'
 * @apiParam (advancedQueryItem) {Array} params parameters passed to Parse.Query operation. e.g. ['collection', 'Content_article']
 * @apiName Content.changelogSubscribe
 * @apiGroup Reactium.Content
 * @apiExample Simple Usage:
import Reactium from 'reactium-core/sdk';

// simple subscription to content with objectId 'zJkUz6dD49'
Reactium.Content.changelogSubscribe('zJkUz6dD49').then(unsubscribe => {
    setTimeout(unsubscribe, 10 * 60 * 1000); // unsubscribe in 10 minutes
});

// listen for this content to be deleted
Reactium.Hook.register('changelog-created-zJkUz6dD49', async logEntry => {
    if (logEntry.changeType === 'TRASH') alert(`${logEntry.contentId} in ${logEntry.collection} deleted!`);
});
* @apiExample Advanced Usage:
import Reactium from 'reactium-core/sdk';

// subscribe to any article changes
Reactium.Content.changelogSubscribe(null, [{
    operation: 'equalTo',
    params: ['collection', 'Content_article']
}])
.then(unsubscribe => {
   setTimeout(unsubscribe, 10 * 60 * 1000); // unsubscribe in 10 minutes
});

// listen for deletion of any article
Reactium.Hook.register('changelog-created', async logEntry => {
    if (logEntry.collection === 'Content_article' && logEntry.changeType === 'TRASH')
        alert(`Article ${logEntry.contentId} deleted!`);
});
 */
Content.changelogSubscribe = async (contentId, advancedQuery = []) => {
    const qry = new Parse.Query('Changelog');
    if (contentId) qry.equalTo('contentId', contentId);

    // allow special queries
    if (advancedQuery.length) {
        advancedQuery.forEach(({ operator, params }) => {
            if (operator in qry) {
                qry[operator](...params);
            }
        });
    }

    const subscription = await qry.subscribe();

    subscription.on('create', logEntry => {
        const logObj = serialize(logEntry);
        Reactium.Hook.run('changelog-created', logObj);
        Reactium.Hook.run(`changelog-created-${logEntry.contentId}`, logObj);
    });

    subscription.on('update', logEntry => {
        const logObj = serialize(logEntry);
        Reactium.Hook.run('changelog-updated', logObj);
        Reactium.Hook.run(`changelog-updated-${logEntry.contentId}`, logObj);
    });

    subscription.on('enter', logEntry => {
        const logObj = serialize(logEntry);
        Reactium.Hook.run('changelog-entered', logObj);
        Reactium.Hook.run(`changelog-entered-${logEntry.contentId}`, logObj);
    });

    subscription.on('leave', logEntry => {
        const logObj = serialize(logEntry);
        Reactium.Hook.run('changelog-left', logObj);
        Reactium.Hook.run(`changelog-left-${logEntry.contentId}`, logObj);
    });

    subscription.on('delete', logEntry => {
        const logObj = serialize(logEntry);
        Reactium.Hook.run('changelog-deleted', logObj);
        Reactium.Hook.run(`changelog-deleted-${logEntry.contentId}`, logObj);
    });

    // auto-unsubscribe on logout
    const logoutId = Reactium.Hook.register('user.before.logout', async () => {
        subscription.unsubscribe();
    });
    subscription.on('close', () => Reactium.Hook.unregister(logoutId));

    return subscription.unsubscribe;
};

/**
 * @api {Asynchronous} Content.list(params) Content.list()
 * @apiDescription Get list of content of a specific Type.
 * @apiParam {Object} params See below
 * @apiParam (params) {Mixed} type Type object, or type machineName
 * @apiParam (params) {Boolean} [refresh=false] skip cache check when true
 * @apiParam (params) {Boolean} [optimize=false] if optimize is true, and collection contains
less than 1000 records, the entire set will be delivered in one page for application-side pagination.
 * @apiParam (params) {String} [status=PUBLISHED] "PUBLISHED" or "DRAFT" status of the content
 * @apiParam (params) {String} [orderBy=createdAt] Field to order the results by.
 * @apiParam (params) {String} [direction=descending] Order "descending" or "ascending"
 * @apiParam (params) {Number} [limit=20] Limit page results
 * @apiParam (type) {String} [objectId] Parse objectId of content type
 * @apiParam (type) {String} [uuid] UUID of content type
 * @apiParam (type) {String} [machineName] the machine name of the existing content type
 * @apiName Content.list
 * @apiGroup Reactium.Content
 * @apiExample Usage
import Reactium from 'reactium-core/sdk';

Reactium.Content.list({
    "type": {
        "machineName": "article"
    },
    "orderBy":"title",
    "direction": "ascending",
    "limit": 1,
    "status": "DRAFT"
});
 */
Content.list = async params => {
    const request = { ...params, type: setType(params.type) };
    const contentObj = await Reactium.Cloud.run('content-list', request);

    await Reactium.Hook.run('content-list', contentObj, request);
    return contentObj;
};

Reactium.Hook.register('content-saved', async contentObj => {
    const { canRead = [], canWrite = [] } = await Content.ACLToReadWrite(
        contentObj.ACL,
    );
    contentObj.canRead = canRead;
    contentObj.canWrite = canWrite;
});

export default Content;
