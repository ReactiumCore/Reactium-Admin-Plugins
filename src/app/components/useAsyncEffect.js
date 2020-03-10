import op from 'object-path';
import uuid from 'uuid/v4';
import React, { useState, useEffect } from 'react';

class AsyncUpdate {
    constructor() {
        this.__mounted = true;
    }

    get mounted() {
        return this.__mounted;
    }

    set mounted(value) {
        this.__mounted = value;
    }

    isMounted = () => this.__mounted;
}

/**
 * @api {ReactHook} useAsyncEffect(cb,dependencies) useAsyncEffect()
 * @apiDescription Just like React's built-in `useEffect`, but can use async/await.
If the return is a promise for a function, the function will be used as the unmount
callback.
 * @apiParam {Function} cb Just like callback provided as first argument of `useEffect`, but takes
 as its own first argument a method to see if the component is mounted. This is
 useful for deciding if your async response (i.e. one that would attempt to change state)
 should happen.
 * @apiParam {Array} [deps] Deps list passed to `useEffect`
 * @apiName useAsyncEffect
 * @apiGroup ReactHook
 * @apiExample Reactium Usage
import React, { useState } from 'react';
import { useAsyncEffect } from 'reactium-core/sdk';

const MyComponent = props => {
    const [show, setShow] = useState(false);

    // change state allowing value to show
    // asynchrounously, but only if component is still mounted
    useAsyncEffect(async isMounted => {
        setShow(false);
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (isMounted()) setShow(true);

        // unmount callback
        return () => {};
    }, [ props.value ]);

    return (
        {show && <div>{props.value}</div>}
    );
};
* @apiExample StandAlone Import
import { useAsyncEffect } from '@atomic-reactor/reactium-sdk-core';
 */
// export const useAsyncEffect = (cb, deps) => {
//     const updater = new AsyncUpdate();
//
//     const doEffect = async () => {
//         return cb(updater.isMounted);
//     }
//
//     useEffect(() => {
//         updater.mounted = true;
//         const effectPromise = doEffect();
//
//         return () => {
//             updater.mounted = false;
//             effectPromise.then(unmountCB => {
//                 if (typeof unmountCB === 'function') {
//                     unmountCB();
//                 }
//             });
//         };
//     }, deps);
//
// };
export const useAsyncEffect = (cb, deps) => {
    const doEffect = async updater => {
        return cb(updater.isMounted);
    };
    useEffect(() => {
        const updater = new AsyncUpdate();
        updater.mounted = true;
        const effectPromise = doEffect(updater);
        return () => {
            updater.mounted = false;
            effectPromise.then(unmountCB => {
                if (typeof unmountCB === 'function') {
                    unmountCB();
                }
            });
        };
    }, deps);
};
