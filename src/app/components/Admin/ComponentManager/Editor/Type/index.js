import _ from 'underscore';
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
    // -------------------------------------------------------------------------
    // Props
    // -------------------------------------------------------------------------
    const { editor, namespace, onStatus, ...props } = initialProps;

    // -------------------------------------------------------------------------
    // Components & external handles
    // -------------------------------------------------------------------------
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
    const [state, updateState] = useDerivedState({
        active: op.get(props, 'active'),
        title: op.get(props, 'title'),
        updated: Date.now(),
    });
    const setState = newState => {
        if (unMounted()) return;
        updateState(newState);
    };

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------

    const cx = Reactium.Utils.cxFactory(namespace);

    const dismiss = () => {
        Modal.dismiss();
    };

    const dispatch = (eventType, event = {}, callback) => {
        eventType = String(eventType).toLowerCase();

        const evt = new ComponentEvent(eventType, event);

        handle.dispatchEvent(evt);

        if (unMounted()) return;
        Reactium.Hook.runSync(eventType, evt, handle);

        if (unMounted()) return;
        if (typeof callback === 'function') callback(evt);
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

    const header = (noHook = false) => {
        if (!isStatus(ENUMS.STATUS.INITIALIZED)) return {};

        let { active = 'selector' } = state;

        const output = {
            title: editor.value.name,
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

        if (noHook !== true) {
            dispatch('header', { header: output, active });
        }

        return output;
    };

    const initialize = async () => {
        // SET STATUS TO INITIALIZING
        setStatus(ENUMS.STATUS.INITIALIZING, true);

        // SET STATUS TO INITIALIZED WHEN COMPLETE
        _.defer(() => setStatus(ENUMS.STATUS.INITIALIZED, true));
    };

    const navTo = (panel, direction = 'left') => {
        const scene = refs.get('scene');
        if (!scene) return;

        scene.navTo({ direction, panel });
    };

    const save = (value = {}) => {
        const { uuid } = value;
        editor.save({ [uuid]: value });
        dismiss();
    };

    const unMounted = () => !refs.get('container');

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------
    const _handle = () => ({
        cx,
        dispatch,
        editor,
        header,
        initialize,
        namespace,
        navTo,
        onStatus,
        props,
        save,
        setState,
        state,
        unMounted,
    });
    const [handle, setNewHandle] = useEventHandle(_handle());
    useImperativeHandle(ref, () => handle, [handle]);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    // status
    useEffect(() => {
        dispatch('status', { status }, onStatus);
        switch (status) {
            case ENUMS.STATUS.PENDING:
                initialize();
                break;

            case ENUMS.STATUS.INITIALIZED:
                dispatch('change', { active: state.active });
                break;
        }
    }, [status]);

    // active
    useEffect(() => {
        dispatch('change', { active: state.active });
    }, [state.active]);

    // value
    useEffect(() => {
        handle.editor = editor;
        setNewHandle(handle);
    }, [Object.values(op.get(editor, 'value', {}))]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className={cx()} ref={elm => refs.set('container', elm)}>
            <Dialog collapsible={false} header={header()}>
                <Scene
                    active={state.active}
                    onBeforeChange={({ staged: active }) =>
                        setState({ active })
                    }
                    ref={elm => refs.set('scene', elm)}
                    width='100%'>
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
    active: PropTypes.string,
    namespace: PropTypes.string,
    onStatus: PropTypes.func,
    title: PropTypes.string,
};

Type.defaultProps = {
    active: 'selector',
    namespace: 'admin-components-type',
    onStatus: noop,
    title: __('Component Type'),
};

export { Type, Type as default };
