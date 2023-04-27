/**
 * @function useWindowSize
 * @since 0.0.47
 *
 * @description Window resize hook useful for adding and removing a window resize listener without all the headache.
 *
 * @params params {Object} The parameters to pass to the hook.
 *
 * @prop params.defaultWidth {Number} [Optional] Return a default width when rendering server-side.
 * @prop params.defaultHeight {Number} [Optional] Return a default height when rendering server-side.
 * @prop params.iWin {Window} [Optional] Pass in an alternate window object when using within a portaled iFrame.
 *
 * @return {Object} Returns an object with `width` and `height` properties.
 *
 * @example
    import { useWindowSize } from '@atomic-reactor/reactium-ui/hooks';
    import React, { useEffect } from 'react';

    const myFunctionalComponent = () => {
        const windowSize = useWindowSize({ defaultWidth: 0, defaultHeight: 0 });

        const resized = () => {
            console.log(windowSize);
        };

        useEffect(() => resized(), [windowSize]);

        const render = () => (
            <div>{windowSize}</div>
        );

        return render();
    }
 */

import op from 'object-path';
import { useEffect, useState } from 'react';

const useWindowSize = (params = {}) => {
    const hasWindow = typeof window !== 'undefined';

    let { iWin, defaultWidth, defaultHeight } = params;

    iWin = hasWindow ? iWin || window : null;

    const getSize = () => {
        return hasWindow
            ? {
                  width: hasWindow ? iWin.innerWidth : defaultWidth,
                  height: hasWindow ? iWin.innerHeight : defaultHeight,
              }
            : { width: defautlWidth, height: defaultHeight };
    };

    const [windowSize, setWindowSize] = useState(getSize());

    useEffect(() => {
        if (!hasWindow) {
            return;
        }

        const resized = () => setWindowSize(getSize());

        iWin.addEventListener('resize', resized);

        return () => iWin.removeEventListener('resize', resized);
    }, []);

    return windowSize;
};

export default useWindowSize;
