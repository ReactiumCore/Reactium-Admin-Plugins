import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';
import parserBabel from 'prettier/parser-babylon';
import ReactiumLight from './theme/ReactiumLight';
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

Reactium.CodeEditorTheme =
    Reactium.CodeEditorTheme ||
    Reactium.Utils.registryFactory('CodeEditorTheme');

const defaultFormat = {
    autoCloseBrackets: true,
    autoCloseTags: true,
    jsxSingleQuote: true,
    jsxBracketSameLine: true,
    mode: 'jsx',
    parser: 'babel',
    plugins: [parserBabel, parserHtml],
    printWidth: 80,
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
    output = String(output).trim();

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

const isTextarea = elm => Boolean(elm instanceof HTMLInputElement);

const noop = () => {};

const theme = props => {
    const themeName = _.isObject(props)
        ? op.get(
              props,
              'theme',
              Reactium.Prefs.get('admin.theme.codeEditor', 'ReactiumLight'),
          )
        : props;

    // Find theme in CodeEditorTheme registry
    let theme;
    try {
        const regTheme = _.findWhere(Reactium.CodeEditorTheme.list, {
            id: themeName,
        });
        theme = op.get(regTheme, 'theme', ReactiumLight);
    } catch (err) {
        // Empty on purpose
    }
    theme = theme || ReactiumLight;
    return theme;
};

let CodeEditor = (initialProps, ref) => {
    let {
        className,
        format,
        id,
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
        ...props,
        lines: 1,
        value: initialValue,
        theme: theme(initialProps),
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

    const focus = () => {
        const elm = document.getElementById(id);
        if (elm) elm.focus();
    };

    const getValue = () => formatter(state.value, format);

    const listeners = () => {
        Reactium.Hotkeys.register('code-format', {
            callback: _onHotkey,
            key: 'mod+f',
            order: Reactium.Enums.priority.lowest,
            scope: refs.get('container'),
        });

        return () => {
            Reactium.Hotkeys.unregister('code-format');
        };
    };

    const setValue = value => setState({ value });

    const unMounted = () => !refs.get('container');

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------
    const _handle = () => ({
        dispatch,
        focus,
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

        const lines = Math.max(value.split('\n').length, 1);

        value = formatter(value, format);

        // Update handle
        setHandle({ value });
        setState({ lines });

        // Dispatch event and call onChange handler
        _.defer(() => dispatch('change', { value }, onChange));
    };

    const _onHotkey = e => {
        const elm = e.target;

        e.stopPropagation();
        e.preventDefault();

        let { value } = state;

        const start = elm.selectionStart;
        const line = value.substr(0, start).split('\n').length - 1;

        value = formatter(value, format);

        // move cursor to end of current line
        const end = Number(
            value
                .split('\n')
                .reduce(
                    (e, str, i) => e + (i <= line ? String(str).length + 1 : 0),
                    -1,
                ),
        );

        elm.value = value;
        elm.focus();
        elm.setSelectionRange(end, end);

        setState({ value });
    };

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    // listeners
    useEffect(listeners, []);

    // state.value change
    useEffect(_onChange, [op.get(state, 'value')]);

    // theme change from props
    useEffect(() => {
        setState({ theme: theme(initialProps) });
    }, [initialProps.theme]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <LiveProvider
            code={state.value}
            language={format.mode}
            disabled={state.disabled}
            theme={state.theme}>
            <div
                className={cx()}
                ref={elm => refs.set('container', elm)}
                style={{ ...state.theme.plain, ...state.style }}>
                {state.lineNumbers && (
                    <LineNumbers
                        count={state.lines}
                        className={cx('lines')}
                        theme={state.theme}
                    />
                )}
                <div className={cx('input')} onClick={focus}>
                    <LiveEditor
                        onValueChange={setValue}
                        padding={0}
                        tabSize={format.tabWidth}
                        textareaId={id}
                    />
                </div>
                {state.livePreview && (
                    <div className={cx('preview')}>
                        <LivePreview />
                    </div>
                )}
                {state.showErrors && (
                    <div className={cx('errors')}>
                        <LiveError />
                    </div>
                )}
            </div>
        </LiveProvider>
    );
};

const LineNumbers = ({ className, count, theme }) =>
    count < 1 ? null : (
        <div className={className} style={op.get(theme, 'plain')}>
            {_.range(1, count + 1).map(n => (
                <div key={`line-number-${n}`} className='num'>
                    {n}
                </div>
            ))}
        </div>
    );

CodeEditor = forwardRef(CodeEditor);

CodeEditor.defaultProps = {
    disabled: false,
    format: defaultFormat,
    id: uuid(),
    lineNumbers: false,
    livePreview: false,
    namespace: 'ar-code',
    onChange: noop,
    showErrors: false,
    style: {},
    theme: 'ReactiumLight',
    value: '',
};

export { CodeEditor, CodeEditor as default };
