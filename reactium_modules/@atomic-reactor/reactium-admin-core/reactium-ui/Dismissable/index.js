import ENUMS from './enums';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';
import React, { forwardRef, useImperativeHandle } from 'react';
import {
    useDispatcher,
    useRefs,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Dismissable
 * -----------------------------------------------------------------------------
 */
let Dismissable = ({ children, ...props }, ref) => {
    const refs = useRefs();

    const state = useSyncState({
        ...props,
    });

    const dispatch = useDispatcher({ props, state });

    const isVisible = () => state.get('visible') === true;

    const show = () => {
        if (isVisible()) {
            state.set('animation', null);
            return Promise.resolve();
        }

        const container = refs.get('container');

        TweenMax.killTweensOf(container);

        container.style.display = 'block';
        container.classList.remove('visible');

        dispatch('before-show');

        const { animationEase: ease, animationSpeed } = state.get();

        const animation = new Promise((resolve) => {
            TweenMax.to(container, animationSpeed, {
                ease,
                opacity: 1,
                onComplete: () => complete(resolve),
            });
        });

        state.set({ animation });

        return animation;
    };

    const hide = () => {
        if (!isVisible()) {
            state.set('animation', null);
            return Promise.resolve();
        }

        const container = refs.get('container');

        TweenMax.killTweensOf(container);

        container.style.display = 'block';

        dispatch('before-hide');

        const { animationEase: ease, animationSpeed } = state.get();

        const animation = new Promise((resolve) => {
            TweenMax.to(container, animationSpeed, {
                ease,
                opacity: 0,
                onComplete: () => complete(resolve),
            });
        });

        state.set({ animation });

        return animation;
    };

    const complete = (resolve) => {
        if (isVisible()) {
            state.set({ animation: null, visible: false });
            dispatch('hide');
            dispatch('dismiss');
            dispatch('complete');
            const container = refs.get('container');
            container.removeAttribute('style');
            container.style.display = 'none';
        } else {
            state.set({ animation: null, visible: true });
            dispatch('show');
            dispatch('complete');
        }

        resolve();
    };

    const toggle = (e) => (isVisible() ? hide(e) : show(e));

    const render = () => {
        const { className, visible, namespace } = state.get();

        const cname = cn({
            [className]: !!className,
            [namespace]: !!namespace,
            visible,
        });

        return (
            <div ref={(elm) => refs.set('container', elm)} className={cname}>
                {children}
            </div>
        );
    };

    state.extend('hide', hide);
    state.extend('show', show);
    state.extend('toggle', toggle);

    useImperativeHandle(ref, () => state, []);

    return render();
};

Dismissable = forwardRef(Dismissable);

Dismissable.ENUMS = ENUMS;

Dismissable.propTypes = {
    animationEase: PropTypes.object,
    animationSpeed: PropTypes.number,
    className: PropTypes.string,
    namespace: PropTypes.string,
    onBeforeHide: PropTypes.func,
    onBeforeShow: PropTypes.func,
    onDismiss: PropTypes.func,
    onHide: PropTypes.func,
    onShow: PropTypes.func,
    visible: PropTypes.bool,
};

Dismissable.defaultProps = {
    animationEase: Power2.easeInOut,
    animationSpeed: 0.25,
    namespace: 'ar-dismissable',
    visible: false,
};

export { Dismissable, Dismissable as default };
