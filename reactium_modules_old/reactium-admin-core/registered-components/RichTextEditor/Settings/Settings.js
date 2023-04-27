import _ from 'underscore';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Scrollbars } from '@atomic-reactor/react-custom-scrollbars';
import { ReactEditor, useEditor } from 'slate-react';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';

import Reactium, {
    __,
    ComponentEvent,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useRefs,
    useStatus,
    Zone,
} from 'reactium-core/sdk';

const noop = () => {};

const CloseButton = props => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button
            size={Button.ENUMS.SIZE.XS}
            color={Button.ENUMS.COLOR.CLEAR}
            className='ar-dialog-header-btn dismiss'
            {...props}>
            <Icon name='Feather.X' />
        </Button>
    );
};

const SubmitButton = props => {
    const { Button } = useHookComponent('ReactiumUI');
    return <Button block size={Button.ENUMS.SIZE.MD} {...props} />;
};

let Settings = (initialProps, ref) => {
    const {
        children,
        footer,
        header,
        id,
        onChange,
        onSubmit,
        submitLabel: initialSubmitLabel,
        title: initialTitle,
        value: initialValue,
        ...props
    } = initialProps;

    const editor = useEditor();

    const { Dialog, EventForm } = useHookComponent('ReactiumUI');

    const refs = useRefs();

    const [, setVisible, isVisible] = useStatus(false);

    const [, setReady, isReady] = useStatus(false);

    const [state, _update] = useDerivedState({
        ...props,
        excludes: ['id'],
        submitLabel: initialSubmitLabel,
        title: initialTitle,
        value: {},
    });

    const update = _.debounce(_update, 250);

    const setState = newState =>
        new Promise(resolve => {
            if (unMounted()) return;

            newState = { ...state, ...newState };
            Object.entries(newState).forEach(([key, value]) => {
                op.set(state, key, value);
            });

            update(newState);

            _.defer(() => resolve());
        });

    const setValue = newValue => {
        const form = refs.get('form');
        const value = _getValue(newValue);

        Object.entries(newValue).forEach(([key, val]) =>
            op.set(value, key, val),
        );

        if (_.isEqual(state.value, newValue)) return;

        setState({ value });
        form.setValue(value);
    };

    const hide = (animate = true, clear = true) => {
        editor.panel.hide(animate, clear).setID('rte-panel');
        ReactEditor.focus(editor);
    };

    const unMounted = () => !refs.get('container');

    const submit = () => {
        const form = refs.get('form');
        if (form) form.submit();
    };

    const _header = () => {
        if (_.isFunction(header)) {
            return header();
        }

        if (_.isObject(header)) {
            return header;
        }

        return {
            elements: [<CloseButton onClick={hide} key='close-btn' />],
            title: state.title,
        };
    };

    const _footer = () => {
        if (_.isFunction(footer)) {
            return footer();
        }

        if (_.isObject(footer)) {
            return footer;
        }

        return {
            align: 'right',
            elements: [
                <SubmitButton
                    onClick={submit}
                    key='submit-btn'
                    children={state.submitLabel}
                />,
            ],
        };
    };

    const _getValue = merge => {
        let value = JSON.parse(JSON.stringify(op.get(state, 'value')));
        value = { ...value, ...merge };

        const form = refs.get('form');

        const keys = _.compact(
            Object.entries(form.elements).map(([, elm]) => {
                try {
                    return elm.getAttribute('name');
                } catch (err) {}
            }),
        );

        const newValue = keys.reduce((obj, key) => {
            if (key === 'null') return obj;

            const val = op.get(value, key, null);
            op.set(obj, key, val);
            return obj;
        }, {});

        if (_.isObject(newValue)) {
            Object.keys(newValue).forEach(key => {
                if (state.excludes.includes(key)) op.del(newValue, key);
            });
        }

        Reactium.Hook.runSync('rte-settings-value', newValue);

        return newValue;
    };

    const _onChange = e => {
        if (isReady(false)) return;

        const value = _getValue(e.value);
        const evt = new ComponentEvent('change', { value });

        if (_.isEqual(state.value, value)) return;

        state.value = value;
        handle.state = state;
        handle.value = value;

        handle.dispatchEvent(evt);
        onChange(evt);
        setState({ value });
    };

    const _onSubmit = ({ value }) => {
        value = _getValue(value);
        const evt = new ComponentEvent('submit', { value });

        state.value = value;
        handle.state = state;
        handle.value = value;

        handle.dispatchEvent(evt);
        onSubmit(evt);
    };

    const _handle = () => ({
        hide,
        props,
        refs,
        setState,
        setValue,
        state,
        submit,
        unMounted,
        updateHandle,
        value: state.value,
    });

    const [handle, setHandle] = useEventHandle(_handle());
    const updateHandle = (overrides = {}) => {
        if (unMounted()) return;
        const newHandle = _handle();
        Object.entries(overrides).forEach(([key, val]) =>
            op.set(newHandle, key, val),
        );
        Object.entries(newHandle).forEach(([key, val]) =>
            op.set(handle, key, val),
        );
        setHandle(handle);
    };

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        const value = _getValue(initialValue);
        setState({ value }).then(() => setReady(true, true));
    }, [initialValue]);

    // Move panel to center
    useEffect(() => {
        if (!editor.panel || !refs.get('container')) return;
        if (!isVisible(true)) {
            const container = refs.get('container');

            let { width, height } = container.getBoundingClientRect();

            width = width / 2;
            height = height / 2;

            let ox = window.innerWidth / 2;
            let oy = window.innerHeight / 4;
            let x = ox - width;
            let y = oy - height;
            x = Math.floor(x);
            y = Math.floor(y);

            editor.panel.moveTo(x, y);

            setVisible(true, true);
        }
    }, [editor.panel, refs.get('container')]);

    const render = () => {
        return (
            <div ref={elm => refs.set('container', elm)} {...props}>
                <EventForm
                    onChange={_onChange}
                    onSubmit={_onSubmit}
                    ref={elm => refs.set('form', elm)}
                    value={state.value}>
                    <Dialog
                        className='ar-settings-dialog'
                        collapsible={false}
                        dismissable={false}
                        footer={_footer()}
                        header={_header()}>
                        <Scrollbars>
                            {children}
                            {id && <Zone zone={id} handle={handle} />}
                        </Scrollbars>
                    </Dialog>
                </EventForm>
            </div>
        );
    };

    return render();
};

Settings = forwardRef(Settings);

Settings.propTypes = {
    header: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    footer: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    submitLabel: PropTypes.node,
    title: PropTypes.node,
    value: PropTypes.object,
};

Settings.defaultProps = {
    onChange: noop,
    onSubmit: noop,
    submitLabel: __('Update Properties'),
    title: __('Property Inspector'),
    value: {},
};

export { Settings, Settings as default };
