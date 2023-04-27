import op from 'object-path';

const clear = key => {
    let prefs = get();

    if (key) {
        op.del(prefs, key);
    } else {
        op.set(prefs, {});
    }

    localStorage.setItem('ar-prefs', JSON.stringify(prefs));
    return prefs;
};

const get = (key, defaultValue) => {
    let ls = localStorage.getItem('ar-prefs') || {};
    ls = typeof ls === 'string' ? JSON.parse(ls) : ls;
    return key ? op.get(ls, key, defaultValue) : ls;
};

const set = (key, value) => {
    let prefs = get();
    op.set(prefs, key, value);
    localStorage.setItem('ar-prefs', JSON.stringify(prefs));
    return prefs;
};

const Prefs = {
    clear,
    get,
    set,
};

export { Prefs, Prefs as default };

// TODO: Make it so that prefs are loaded from a user object
