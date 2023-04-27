import _ from 'underscore';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';

let _shortcodes = {};

const SDK = {};

SDK.Component = Reactium.Utils.registryFactory('ShortcodesComponents');

SDK.Component.get = id => {
    const item = _.findWhere(SDK.Component.list, { id });
    if (!item) return;

    op.set(item, 'id', id);
    return item;
};

SDK.clearCache = () => {
    _shortcodes = {};
};

SDK.delete = async (...args) => {
    _.flatten([...args]).forEach(code => {
        const key = SDK.parseKey(code);
        if (op.has(_shortcodes, key)) op.del(_shortcodes, key);
    });

    return SDK.save(_shortcodes);
};

SDK.isKey = e => {
    // prettier-ignore
    const excluded = [8, 9, 13, 16, 17, 18, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 46, 93];

    return excluded.includes(e.which) || e.ctrlKey || e.metaKey || e.altKey
        ? false
        : true;
};

SDK.list = refresh => {
    return !refresh
        ? _shortcodes
        : Reactium.Setting.get('shortcodes', {}, refresh).then(results => {
              _shortcodes = results;
              return _shortcodes;
          });
};

SDK.parseCode = (value, tail = false) => {
    value = String(value).replace(/[^\-a-z0-9]/gi, '');
    value = String(`[${String(value).replace(/\[|\]/g, '')}]`).toLowerCase();
    value = String(value).replace('[]', '');
    value = value === '[' ? '' : value;
    value = value === ']' ? '' : value;

    if (tail === true) {
        value =
            String(value).slice(-2) === '-]'
                ? String(value).replace('-]', ']')
                : value;
    }

    return value;
};

SDK.parseKey = value => String(value).replace(/\[|\]/g, '');

SDK.save = async (newShortcodes = {}) => {
    _shortcodes = newShortcodes;
    await Reactium.Setting.set('shortcodes', newShortcodes);
    return _shortcodes;
};

Reactium.Shortcode = SDK;

export default SDK;
