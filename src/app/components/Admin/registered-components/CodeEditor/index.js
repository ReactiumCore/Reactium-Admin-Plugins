import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';
import parserBabel from 'prettier/parser-babylon';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';

import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

import Reactium, {
    ComponentEvent,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const defaultFormat = {
    autoCloseBrackets: true,
    autoCloseTags: true,
    jsxSingleQuote: true,
    jsxBracketSameLine: true,
    mode: 'jsx',
    parser: 'babel',
    plugins: [parserBabel, parserHtml],
    printWidth: 200000000,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
};

const prettyJSON = (value, options = {}) => {
    if (!value) return {};

    let output;
    try {
        output = JSON.stringify(value, null, op.get(options, 'tabWidth', 2));
    } catch (err) {
        return value;
    }

    return output;
};

const prettyJSX = (value, options) => {
    if (!value || value === '') return '';

    let output;
    try {
        output = prettier.format(value, options);
    } catch (err) {
        return value;
    }

    output = String(output).trim();
    let oarray = output.split(';');
    if (oarray.length > 0) oarray.pop();
    output = oarray.join('');

    return output || '';
};

const formatter = (value, opts) => {
    const { mode, ...options } = opts;
    switch (mode) {
        case 'json':
            return prettyJSON(value, options);

        default:
            return prettyJSX(value, options);
    }
};

const noop = () => {};

let CodeEditor = (initialProps, ref) => {
    let {
        className,
        format,
        id = uuid(),
        namespace,
        onChange = noop,
        value: initialValue,
        ...props
    } = initialProps;

    // backfill the format object to protect from missing values when manually set
    format = { ...defaultFormat, ...format };

    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const refs = useRefs();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, update] = useDerivedState({
        livePreview: false,
        showErrors: false,
        value: initialValue,
        ...props,
    });
    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------
    const cx = suffix => {
        if (className && namespace) {
            return cn(
                Reactium.Utils.cxFactory(namespace)(suffix),
                Reactium.Utils.cxFactory(className)(suffix),
            );
        }

        if (className) {
            Reactium.Utils.cxFactory(className)(suffix);
        }

        if (namespace) {
            return Reactium.Utils.cxFactory(namespace)(suffix);
        }
    };

    const dispatch = async (eventType, event = {}, callback) => {
        if (!_.isObject(event)) {
            throw new Error(
                'CodeEditor.dispatch() expects 2nd parameter to be of type Object',
            );
        }

        eventType = String(eventType).toLowerCase();

        const evt = new ComponentEvent(eventType, event);

        handle.dispatchEvent(evt);

        if (unMounted()) return;
        await Reactium.Hook.run(`component-manager-${eventType}`, evt, handle);

        if (unMounted()) return;
        if (typeof callback === 'function') await callback(evt);
    };

    const getValue = () => formatter(state.value, format);

    const setValue = value => setState({ value });

    const unMounted = () => !refs.get('container');

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------
    const _handle = () => ({
        dispatch,
        getValue,
        setState,
        setValue,
        state,
        value: state.value,
    });

    const [handle, updateHandle] = useEventHandle(_handle());
    const setHandle = (newHandle = {}) => {
        if (unMounted()) return;
        Object.entries(newHandle).forEach(([key, value]) =>
            op.set(handle, key, value),
        );
        updateHandle(handle);
    };

    useImperativeHandle(ref, () => handle, [handle]);

    const _onChange = () => {
        let { value } = state;

        value = formatter(value, format);

        // Update handle
        setHandle({ value });

        // Dispatch event and call onChange handler
        _.defer(() => dispatch('change', { value }, onChange));
    };

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    // state.value change
    useEffect(_onChange, [op.get(state, 'value')]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <LiveProvider code={state.value}>
            <div
                className={cx()}
                ref={elm => refs.set('container', elm)}
                style={state.style}>
                <div className={cx('editor')}>
                    <div className={cx('input')}>
                        <LiveEditor
                            onValueChange={setValue}
                            padding={16}
                            tabSize={format.tabWidth}
                            textareaId={id}
                        />
                    </div>
                    {state.livePreview && (
                        <div className={cx('preview')}>
                            <LivePreview />
                        </div>
                    )}
                </div>
                {state.showErrors && (
                    <div className={cx('errors')}>
                        <LiveError />
                    </div>
                )}
            </div>
        </LiveProvider>
    );
};

CodeEditor = forwardRef(CodeEditor);

CodeEditor.defaultProps = {
    format: defaultFormat,
    livePreview: false,
    namespace: 'ar-code',
    onChange: ({ value }) => console.log(value),
    showErrors: false,
    style: {},
    value: '',
};

export { CodeEditor, CodeEditor as default };
