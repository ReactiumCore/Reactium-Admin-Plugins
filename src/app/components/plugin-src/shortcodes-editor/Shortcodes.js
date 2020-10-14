import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import ShortcodeListItem from './ShortcodeListItem';
import { Scrollbars } from 'react-custom-scrollbars';

import SDK from './sdk';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
    useRegisterHandle,
    useStatus,
} from 'reactium-core/sdk';

import React, { useRef, useEffect } from 'react';

const ENUMS = {
    STATUS: {
        BUSY: 'BUSY',
        PENDING: 'PENDING',
        INITIALIZING: 'INITIALIZING',
        READY: 'READY',
    },
};

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Shortcodes
 * -----------------------------------------------------------------------------
 */
let Shortcodes = ({
    children,
    className,
    namespace,
    onStatus,
    title,
    ...props
}) => {
    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const formRef = useRef();
    const inputRef = useRef();

    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    // -------------------------------------------------------------------------
    // Components
    // -------------------------------------------------------------------------
    const Helmet = useHookComponent('Helmet');
    const ConfirmBox = useHookComponent('ConfirmBox');
    const {
        Button,
        Dropdown,
        Icon,
        EventForm,
        Spinner,
        Toast,
    } = useHookComponent('ReactiumUI');
    const tools = useHandle('AdminTools');

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, update] = useDerivedState({
        shortcodes: SDK.list(),
        type: SDK.Component.list[0],
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------

    // cx(suffix:String);
    // className extension
    const cx = Reactium.Utils.cxFactory(namespace);

    const deleteCode = code => {
        // Optimistically update the state
        const key = SDK.parseKey(code);

        let shortcodes = { ...op.get(state, 'shortcodes') };
        op.del(shortcodes, key);
        setState({ shortcodes });

        // Do async delete
        return SDK.delete(code);
    };

    // dispatch(eventType:String, event:Object, callback:Function);
    // dispatch events, run a hook, execute a callack
    const dispatch = async (eventType, event, callback) => {
        if (unMounted()) return;

        eventType = String(eventType).toUpperCase();

        const evt = new CustomEvent(eventType, { detail: event });

        handle.dispatchEvent(evt);

        if (unMounted()) return;
        await Reactium.Hook.run(`shortcodes-${eventType}`, evt, handle);

        if (unMounted()) return;
        if (typeof callback === 'function') await callback(evt);
    };

    // initialize();
    // run initialization process
    const initialize = async () => {
        // SET STATUS TO INITIALIZING
        setStatus(ENUMS.STATUS.INITIALIZING);

        // DO YOUR INITIALIZATION HERE
        const shortcodes = await SDK.list(true);

        // SET STATUS TO INITIALIZED WHEN COMPLETE
        _.delay(() => {
            setStatus(ENUMS.STATUS.READY);
            setState({ fetched: Date.now() });
        }, 500);

        return shortcodes;
    };

    // unmount();
    // check if the component has been unmounted
    const unMounted = () => !formRef.current;

    const save = async (silent = false) => {
        if (silent !== true) {
            Toast.show({
                icon: 'Feather.Check',
                message: __('Shortcodes updated'),
                type: Toast.TYPE.INFO,
            });
        }

        setStatus(ENUMS.STATUS.BUSY);

        const shortcodes = formRef.current.getValue();

        await SDK.save(shortcodes);
        setStatus(ENUMS.STATUS.READY);
    };

    const saveHotkey = e => {
        if (e) e.preventDefault();
        save();
    };

    const type = id => SDK.Component.get(id);

    const onCodeBlur = e => {
        e.target.value = SDK.parseCode(e.target.value, true);
    };

    const onCodeDelete = e => {
        const { code } = e.currentTarget.dataset;
        const Modal = op.get(tools, 'Modal');

        const confirm = c => {
            Toast.show({
                icon: 'Feather.Check',
                message: __('Shortcode %code deleted').replace('%code', c),
                type: Toast.TYPE.INFO,
            });

            Modal.dismiss();

            // Async update Shortcodes
            deleteCode(code);
        };

        Modal.show(
            <ConfirmBox
                message={__('Delete %code shortcode?').replace('%code', code)}
                onCancel={() => Modal.hide()}
                onConfirm={() => confirm(code)}
                title='Confirm Delete'
            />,
        );
    };

    const onCodeKeyDown = e => {
        if (!SDK.isKey(e)) return;

        e.preventDefault();
        e.stopPropagation();
        const value = e.which === 189 ? '-' : String.fromCharCode(e.which);
        e.target.value = SDK.parseCode(e.target.value + value);
        const cursor = e.target.value.length - 1;
        e.target.setSelectionRange(cursor, cursor);
        return;
    };

    const onCodeSubmit = e => {
        const { code, replacer = '' } = e.value;
        const { shortcodes = {}, type } = state;
        const key = SDK.parseKey(code);

        if (!code || !key) return;
        const inputShortcode = document.getElementById('shortcode-code');

        if (op.get(shortcodes, key)) {
            const error = { message: `${code} already in use` };
            Toast.show({
                icon: 'Feather.AlertOctagon',
                message: __(error.message),
                type: Toast.TYPE.ERROR,
            });
            if (inputShortcode) {
                inputShortcode.focus();
            }
            setState({ error });
            return;
        }

        const newCodes = {
            ...shortcodes,
            [key]: { code, replacer, key, type: type.id },
        };

        // Cleanup UI
        inputRef.current.setValue(null);
        if (inputShortcode) {
            inputShortcode.focus();
        }

        // Optimistically update state
        setState({ error: null, shortcodes: newCodes });

        // Do async save
        save();
    };

    const onItemSelect = ({ item, key }) => {
        let shortcodes = { ...op.get(state, 'shortcodes') };
        op.set(shortcodes, [key, 'type'], item.id);
        setState({ shortcodes });
    };

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------

    const _handle = () => ({
        ENUMS,
        EventForm: formRef,
        children,
        className,
        cx,
        delete: deleteCode,
        dispatch,
        initialize,
        namespace,
        onStatus,
        props,
        save,
        setState,
        setStatus,
        state,
        unMounted,
    });
    const [handle] = useEventHandle(_handle());

    useRegisterHandle('Shortcodes', () => handle);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    // Status change
    useEffect(() => {
        dispatch('status', { status }, onStatus);
    }, [status]);

    // Load Setting
    useAsyncEffect(
        async mounted => {
            if (isStatus(ENUMS.STATUS.PENDING)) {
                const shortcodes = await initialize();
                if (mounted) setState({ shortcodes });
            }
        },
        [status],
    );

    // save hotkey
    useEffect(() => {
        if (!formRef.current) return;
        Reactium.Hotkeys.register('shortkey-save', {
            callback: saveHotkey,
            key: 'mod+s',
            order: Reactium.Enums.priority.lowest,
            scope: document,
        });

        return () => {
            Reactium.Hotkeys.unregister('shortkey-save');
        };
    }, [!!formRef.current]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className={cx()}>
            {title && (
                <Helmet>
                    <title>{title}</title>
                </Helmet>
            )}
            <EventForm
                className={cx('insert')}
                ref={inputRef}
                onSubmit={e => onCodeSubmit(e)}>
                <div className={cn('input-group', { error: !!state.error })}>
                    <input
                        className='code'
                        id='shortcode-code'
                        name='code'
                        onBlur={onCodeBlur}
                        onKeyDown={onCodeKeyDown}
                        placeholder='[shortcode]'
                        type='text'
                    />
                    <Dropdown
                        data={SDK.Component.list}
                        onItemSelect={({ item }) => setState({ type: item })}
                        valueField='id'
                        selection={[state.type.id]}>
                        <Button
                            block
                            className='type'
                            color={Button.ENUMS.COLOR.CLEAR}
                            data-dropdown-element>
                            <span className='label'>{state.type.label}</span>
                            <span className='icon'>
                                <Icon
                                    name='Feather.ChevronDown'
                                    className='icon'
                                />
                            </span>
                        </Button>
                    </Dropdown>
                    <input
                        className='replacer'
                        id='shortcode-replacer'
                        name='replacer'
                        placeholder='replacement'
                        type='text'
                    />
                    <Button
                        className='action'
                        color={Button.ENUMS.COLOR.PRIMARY}
                        type={Button.ENUMS.TYPE.SUBMIT}>
                        <Icon name='Feather.Plus' size={24} />
                    </Button>
                </div>
            </EventForm>
            <EventForm
                className={cx('list-form')}
                ref={formRef}
                value={state.shortcodes}>
                <Scrollbars>
                    <div className={cx('list')}>
                        {Object.entries(state.shortcodes)
                            .reverse()
                            .map(([key, value]) => (
                                <ShortcodeListItem
                                    key={`code${key}`}
                                    code={value.code}
                                    data={SDK.Component.list}
                                    replacer={value.replacer}
                                    type={type(value.type || 'ShortcodeText')}
                                    onBlur={onCodeBlur}
                                    onDelete={onCodeDelete}
                                    onKeyDown={onCodeKeyDown}
                                    onItemSelect={onItemSelect}
                                />
                            ))}
                    </div>
                </Scrollbars>
            </EventForm>
            {isStatus(ENUMS.STATUS.INITIALIZING) && (
                <Spinner className={cx('spinner')} />
            )}
        </div>
    );
};

Shortcodes.ENUMS = ENUMS;

Shortcodes.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    onStatus: PropTypes.func,
    title: PropTypes.string,
};

Shortcodes.defaultProps = {
    namespace: 'shortcodes',
    onStatus: noop,
    title: 'Shortcodes',
};

export { Shortcodes, Shortcodes as default };
