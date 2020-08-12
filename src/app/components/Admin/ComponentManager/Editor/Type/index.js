import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';

import Reactium, {
    __,
    ComponentEvent,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

import React, { forwardRef, useImperativeHandle, useEffect } from 'react';

const ENUMS = {
    STATUS: {
        PENDING: 'PENDING',
        INITIALIZING: 'INITIALIZING',
        INITIALIZED: 'INITIALIZED',
        READY: 'READY',
    },
};

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Type
 * -----------------------------------------------------------------------------
 */
let Type = (initialProps, ref) => {
    let {
        children,
        className,
        editor,
        namespace,
        onStatus,
        state: initialState,
        ...props
    } = initialProps;

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const { Button, Icon, Dialog, Scene } = useHookComponent('ReactiumUI');

    const Selector = useHookComponent('ComponentManagerTypeSelector');
    const JsxComponent = useHookComponent('ComponentManagerJsxComponent');
    const HookComponent = useHookComponent('ComponentManagerHookComponent');
    const ContentComponent = useHookComponent(
        'ComponentManagerContentComponent',
    );

    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const refs = useRefs();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, update] = useDerivedState(initialState);
    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------

    // cx(suffix:String);
    // className extension
    const cx = Reactium.Utils.cxFactory(className || namespace);

    // dispatch(eventType:String, event:Object, callback:Function);
    // dispatch events, run a hook, execute a callack
    const dispatch = async (eventType, event = {}, callback) => {
        eventType = String(eventType).toLowerCase();

        const evt = new ComponentEvent(eventType, event);

        handle.dispatchEvent(evt);

        if (unMounted()) return;
        await Reactium.Hook.run(eventType, evt, handle);

        if (unMounted()) return;
        if (typeof callback === 'function') await callback(evt);
    };

    const dismiss = () => {
        Modal.hide();
    };

    const getIcon = active => {
        switch (String(active).toLowerCase()) {
            case 'hook':
                return 'Linear.Chip';

            case 'content':
                return 'Linear.Typewriter';

            case 'jsx':
                return 'Linear.MagicWand';
        }
    };

    const header = () => {
        const { active, title } = state;
        return {
            title: active !== 'selector' ? `${title}: ${active}` : title,
            elements: _.compact([
                active !== 'selector' ? (
                    <Button
                        className='ar-dialog-header-btn'
                        color={Button.ENUMS.COLOR.CLEAR}
                        onClick={() => navTo('selector', 'right')}
                        key='component-type-selector'
                        style={{ paddingLeft: 4 }}>
                        <Icon name={getIcon(active)} />
                    </Button>
                ) : null,
                <Button
                    className='ar-dialog-header-btn'
                    color={Button.ENUMS.COLOR.CLEAR}
                    onClick={dismiss}
                    key='component-type-dismiss'>
                    <Icon name='Feather.X' />
                </Button>,
            ]),
        };
    };

    // initialize();
    // run initialization process
    const initialize = async () => {
        // SET STATUS TO INITIALIZING
        setStatus(ENUMS.STATUS.INITIALIZING);

        // DO YOUR INITIALIZATION HERE

        // SET STATUS TO INITIALIZED WHEN COMPLETE
        setStatus(ENUMS.STATUS.INITIALIZED);
    };

    const navTo = (panel, direction = 'left') => {
        const scene = refs.get('scene');
        if (!scene) return;

        scene.navTo({ direction, panel });
    };

    // unmount();
    // check if the component has been unmounted
    const unMounted = () => !refs.get('scene');

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------
    const _handle = () => ({
        children,
        className,
        cx,
        dispatch,
        editor,
        initialize,
        namespace,
        navTo,
        onStatus,
        props,
        setState,
        state,
        unMounted,
    });
    const [handle, setNewHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------
    // Status change
    useEffect(() => {
        dispatch('status', { status }, onStatus);

        switch (status) {
            case ENUMS.STATUS.PENDING:
                initialize();
                break;
        }
    }, [status]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    //   The unMounted() function relies on refs.get('container').
    //   If it is not present, setState() will not execute.
    //   This could lead to your component rendering empty if you have a
    //   condition that checks state and renders null if certain conditions
    //   are not met.
    // -------------------------------------------------------------------------
    return (
        <div className={cx()}>
            <Dialog collapsible={false} header={header()}>
                <Scene
                    active={state.active}
                    ref={elm => refs.set('scene', elm)}
                    width='100%'
                    height={520}
                    onChange={({ active }) => setState({ active })}>
                    <Selector id='selector' handle={handle} />
                    <ContentComponent id='content' handle={handle} />
                    <HookComponent id='hook' handle={handle} />
                    <JsxComponent id='jsx' handle={handle} />
                </Scene>
            </Dialog>
        </div>
    );
};

Type = forwardRef(Type);

Type.ENUMS = ENUMS;

Type.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    onStatus: PropTypes.func,
    state: PropTypes.object,
};

Type.defaultProps = {
    namespace: 'admin-components-type',
    onStatus: noop,
    state: {
        active: 'selector',
        title: __('Component Type'),
    },
};

export { Type, Type as default };
