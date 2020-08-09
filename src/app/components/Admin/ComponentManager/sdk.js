import uuid from 'uuid/v4';
import _ from 'underscore';
import op from 'object-path';
import slugify from 'slugify';
import Reactium, { __ } from 'reactium-core/sdk';

let _components = {};

const errorName = __('Component name is a required parameter');
const errorUuid = __('Component uuid is a required parameter');

const SDK = {};

SDK.add = async items => {
    items = !_.isArray(items) ? [items] : items;
    items.forEach(item => {
        if (!op.get(item, 'name')) throw new Error(errorName);

        item.uuid = op.get(item, 'uuid', uuid());
        item.name = slugify(item.name);

        _components[item.uuid] = item;
    });

    return SDK.save(_components);
};

SDK.update = async items => {
    items = !_.isArray(items) ? [items] : items;
    items.forEach(item => {
        if (!op.get(item, 'name')) throw new Error(errorName);
        if (!item.uuid) throw new Error(errorUuid);

        item.uuid = op.get(item, 'uuid');
        item.name = slugify(op.get(item, 'name'));

        _components[item.uuid] = item;
    });

    return SDK.save(_components);
};

SDK.delete = async keys => {
    keys = _.flatten([keys]);
    keys.sort();
    keys.reverse();
    keys.forEach(key => op.del(_components, key));

    return SDK.save(_components);
};

SDK.save = async (newComponents = {}) => {
    _components = newComponents;

    try {
        await Reactium.Setting.set('components', newComponents);
    } catch (err) {
        /* Empty on purpose */
    }

    return _components;
};

SDK.list = refresh => {
    return !refresh
        ? _components
        : Reactium.Setting.get('components', {}, refresh).then(results => {
              _components = results;
              return _components;
          });
};

export default SDK;
