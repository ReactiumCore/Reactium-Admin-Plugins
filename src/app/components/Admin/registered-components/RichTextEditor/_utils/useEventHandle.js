import React, { useState } from 'react';

class ComponentTarget extends EventTarget {
    constructor(handle) {
        super();
        this.update = handle => {
            Object.entries(handle).forEach(
                ([key, value]) => (this[key] = value),
            );
        };

        this.update(handle);
    }
}

const useEventHandle = value => {
    const [handle] = useState(new ComponentTarget(value));

    const setHandle = value => {
        handle.update(value);
    };

    return [handle, setHandle];
};

export default useEventHandle;
