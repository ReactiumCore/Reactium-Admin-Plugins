import fs from 'fullscrn';

/**
 * @api {Class} Fullscreen Fullscreen
 * @apiGroup Reactium.Utilities
 * @apiName Fullscreen
 * @apiDescription Cross browser utility for toggling fullscreen mode.
 * @apiParam (Event) {Event} fullscreenchange Triggered when the browser's fullscreen state changes.
 * @apiExample Usage:
 // isExpanded()
 Reactium.Utils.Fullscreen.isExpanded();

 // isCollapsed()
 Reactium.Utils.Fullscreen.isCollapsed();

 // collapse()
 Reactium.Utils.Fullscreen.collapse();

 // expand()
 Reactium.Utils.Fullscreen.expand();

 // toggle()
 Reactium.Utils.Fullscreen.toggle();

 // Event: fullscreenchange
import React, { useEffect, useState } from 'react';
import Reactium from 'reactium-core/sdk';

const MyComponent = () => {
    const [state, setState] = useState(Reactium.Utils.Fullscreen.isExpanded());

    const update = () => {
        setState(Reactium.Utils.Fullscreen.isExpanded());
    }

    useEffect(() => {
        // ssr safety
        if (typeof document === 'undefined') return;

        // listen for fullscreenchange
        document.addEventListener('fullscreenchange', update);

        // prevent memory leak
        return () => {
            document.removeEventListener('fullscreenchange', update);
        };
    });

    return (<div>{state}</div>);
};
 */
class Fullscreen {
    constructor(element) {
        this.element = element || document.body;

        this.update = () => {
            document.body.classList.remove('fullscreen');

            if (!this) {
                document.removeEventListener('fullscreenchange', this.update);
                return;
            }

            if (document.fullscreen) {
                document.body.classList.add('fullscreen');
            }
        };

        document.addEventListener('fullscreenchange', this.update);
    }

    /**
     * @api {Function} Fullscreen.isExpanded() Fullscreen.isExpanded()
     * @apiGroup Reactium.Utilities
     * @apiName Fullscreen.isExpanded
     * @apiDescription Determines if the browser window is fullscreen. Returns `true|false`.
     */
    isExpanded = () => document.fullscreen;

    /**
     * @api {Function} Fullscreen.isCollapsed() Fullscreen.isCollapsed()
     * @apiGroup Reactium.Utilities
     * @apiName Fullscreen.isCollapsed
     * @apiDescription Determines if the browser window is not fullscreen. Returns `true|false`.
     */
    isCollapsed = () => !document.fullscreen;

    /**
     * @api {Function} Fullscreen.collapse() Fullscreen.collapse()
     * @apiGroup Reactium.Utilities
     * @apiName Fullscreen.collapse
     * @apiDescription Exits fullscreen mode.
     */
    collapse = () => document.exitFullscreen();

    /**
     * @api {Function} Fullscreen.expand() Fullscreen.expand()
     * @apiGroup Reactium.Utilities
     * @apiName Fullscreen.expand
     * @apiDescription Enters fullscreen mode.
     */
    expand = async () => this.element.requestFullscreen();

    /**
     * @api {Function} Fullscreen.toggle() Fullscreen.toggle()
     * @apiGroup Reactium.Utilities
     * @apiName Fullscreen.toggle
     * @apiDescription Enters or Exits fullscreen mode depending on the current fullscreen state.
     */
    toggle = () => (this.isExpanded() ? this.collapse() : this.expand());
}

export default Fullscreen;
