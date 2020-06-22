// TODO: add `inline` parameter to formats that should be treated as such and auto read them into editor.isInline function.

import Leaf from './Leaf';
import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import Element from './Element';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import RTEPlugin from './RTEPlugin';
import PropTypes from 'prop-types';
import { createEditor } from 'slate';
import { Editable, ReactEditor, Slate } from 'slate-react';
import { useRegistryFilter, useEditorPlugins, useSelectProps } from './_utils';

import Reactium, {
    useDerivedState,
    useEventHandle,
    useHookComponent,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';

const noop = () => {};

const RichTextEditor = forwardRef((initialProps, ref) => {
    // 0.0 - Get props
    const {
        className,
        id,
        name,
        namespace,
        onChange,
        panel: showPanel,
        sidebar: showSidebar,
        toolbar: showToolbar,
        blocks: initialBlocks,
        buttons: initialButtons,
        colors: initialColors,
        dragProps: initialDragProps,
        fonts: initialFonts,
        formats: initialFormats,
        hotkeys: initialHotkeys,
        plugins: initialPlugins,
        tabs: initialTabs,
        ...props
    } = useSelectProps({ props: initialProps, exclude: ['value'] });

    // 0.1 - Drag panel
    const Panel = useHookComponent('DragPanel');

    // 0.2 - Component state
    const [state, setState] = useDerivedState({
        ...props,
        change: 0,
        id,
    });

    // 0.3 - References
    const containerRef = useRef();
    const panelRef = useRef();
    const sidebarRef = useRef();
    const toolbarRef = useRef();

    // 1.0 - Must be called before editor is created
    const [plugins, setPlugins] = useEditorPlugins(initialPlugins);

    // 2.0 - Must be called after plugin aggregation
    const editor = useMemo(() => {
        let editor = createEditor();
        // Panel UI ref
        editor.panel = panelRef.current;
        editor.sidebar = sidebarRef.current;
        editor.toolbar = toolbarRef.current;

        // Excludes, Includes, & Filters
        editor.exclude = op.get(state, 'exclude', {});
        editor.include = op.get(state, 'include', {});
        editor.filter = op.get(state, 'filter');

        const _plugins = _.pluck(Object.values(plugins), 'plugin');

        _plugins.forEach(plugin => {
            editor = plugin(editor);
        });

        return editor;
    }, []);

    // 3.0 - Editor component aggregation
    const [blocks, setBlocks] = useRegistryFilter(
        editor,
        'blocks',
        initialBlocks || Reactium.RTE.blocks,
    );

    const [buttons, setButtons] = useRegistryFilter(
        editor,
        'buttons',
        initialButtons || Reactium.RTE.buttons,
    );

    const [colors, setColors] = useRegistryFilter(
        editor,
        'colors',
        initialColors || Reactium.RTE.colors,
    );

    const [dragProps, setDragProps] = useState(initialDragProps);

    const [fonts, setFonts] = useRegistryFilter(
        editor,
        'fonts',
        initialFonts || Reactium.RTE.fonts,
    );

    const [formats, setFormats] = useRegistryFilter(
        editor,
        'formats',
        initialFormats || Reactium.RTE.formats,
    );

    const [hotkeys, setHotkeys] = useRegistryFilter(
        editor,
        'hotkeys',
        initialHotkeys || Reactium.RTE.hotkeys,
    );

    const [tabs, setTabs] = useRegistryFilter(
        editor,
        'tabs',
        initialTabs || Reactium.RTE.tabs,
    );

    const focus = e => {
        if (e.target !== e.currentTarget) return;
        setTimeout(() => {
            ReactEditor.focus(editor);
            editor.focusEnd();
            handle.dispatchEvent(
                new FocusEvent('focus', {
                    relatedTarget: containerRef.current,
                }),
            );
        }, 125);
    };

    // 4.0 - Editor value
    const [value, setValue] = useState(op.get(initialProps, 'value'));

    // 6.0 - Handlers
    const _onChange = newValue => {
        const equal = _.isEqual(value, { children: newValue });
        if (equal === true) return;
        setValue({ children: newValue });
    };

    const _onKeyDown = e => Reactium.RTE.hotKey(editor, e, hotkeys);

    // 7.0 - Renderers
    const _renderElement = useCallback(
        props => (
            <Element {...props} {...handle} blocks={blocks} formats={formats} />
        ),
        [(blocks, editor)],
    );

    const _renderLeaf = useCallback(
        props => <Leaf {...props} {...handle} formats={formats} />,
        [formats, editor],
    );

    // 8.0 - Utilites
    const cname = () => {
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    const cx = cls => _.uniq([namespace, cls]).join('-');

    const nodes = () =>
        _.sortBy(
            Object.entries({ ...formats, ...blocks }).map(([id, value]) => {
                op.set(value, 'id', id);
                return value;
            }),
            'order',
        );

    // 9.0 - Handle
    const _handle = () => ({
        container: containerRef.current,
        dragProps,
        editor,
        focus,
        id,
        name,
        nodes,
        props,
        setBlocks,
        setButtons,
        setColors,
        setDragProps,
        setFonts,
        setFormats,
        setHotkeys,
        setPlugins,
        setState,
        setTabs,
        setValue,
        state,
        value,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    // 10.0 - Side effects

    // 10.1 - Handle update.
    useEffect(() => {
        const newHandle = _handle();

        setState({ updated: Date.now() });
        setHandle(newHandle);
        editor.handle = newHandle;
    }, [
        buttons,
        blocks,
        colors,
        fonts,
        formats,
        plugins,
        tabs,
        value,
        state.filter,
        state.exclude,
        state.include,
        Panel,
        op.get(editor, 'selection'),
    ]);

    // 10.2 - Value update.
    useEffect(() => {
        // on value change
        handle.dispatchEvent(new Event('change'));

        onChange({
            type: 'change',
            target: handle,
            currentTarget: editor,
        });
    }, [value]);

    // 10.3 - Set editor.panel value
    useEffect(() => {
        if (panelRef.current && editor.panel !== panelRef.current) {
            editor.panel = panelRef.current;
        }

        if (sidebarRef.current && editor.sidebar !== sidebarRef.current) {
            editor.sidebar = sidebarRef.current;
        }

        if (toolbarRef.current && editor.toolbar !== toolbarRef.current) {
            editor.toolbar = toolbarRef.current;
        }
    });

    // 10.4 - Extend editor with state data
    useEffect(() => {
        editor.blocks = blocks;
        editor.buttons = buttons;
        editor.colors = colors;
        editor.fonts = fonts;
        editor.formats = formats;
        editor.hotkeys = hotkeys;
        editor.plugins = plugins;
        editor.tabs = tabs;
        editor.target = handle;
    }, [
        handle,
        blocks,
        buttons,
        colors,
        fonts,
        formats,
        hotkeys,
        plugins,
        tabs,
    ]);

    // 10.5 - Focus
    // TODO: Figure out a better way to apply focus to the editor
    // useEffect(() => {
    //     if (!containerRef.current || typeof window === 'undefined') return;
    //     containerRef.current.addEventListener('mousedown', focus);
    //     containerRef.current.addEventListener('touchstart', focus);
    //
    //     return () => {
    //         containerRef.current.removeEventListener('mousedown', focus);
    //         containerRef.current.removeEventListener('touchstart', focus);
    //     };
    // }, [containerRef.current]);

    // 11.0 - Render
    return (
        <div className={cname()} ref={containerRef} id={id}>
            <Slate
                editor={editor}
                onChange={_onChange}
                value={op.get(value, 'children', [])}>
                <Editable
                    {...props}
                    onKeyDown={_onKeyDown}
                    renderElement={_renderElement}
                    renderLeaf={_renderLeaf}
                />
                {showToolbar === true && (
                    <Toolbar
                        {...handle}
                        className={cx('toolbar')}
                        ref={toolbarRef}
                    />
                )}
                {showSidebar === true && (
                    <Sidebar
                        {...handle}
                        className={cx('sidebar')}
                        ref={sidebarRef}
                    />
                )}
                {showPanel === true && (
                    <Panel
                        autohide
                        className={cx('panel')}
                        draggable
                        dragProps={dragProps}
                        ref={panelRef}
                        id={cx('panel')}
                        parent={document.body}
                        visible={false}
                    />
                )}
            </Slate>
        </div>
    );
});

RichTextEditor.propTypes = {
    autoFocus: PropTypes.bool,
    blocks: PropTypes.object,
    buttons: PropTypes.object,
    className: PropTypes.string,
    colors: PropTypes.object,
    dragProps: PropTypes.object,
    exclude: PropTypes.shape({
        blocks: PropTypes.array,
        buttons: PropTypes.array,
        formats: PropTypes.array,
    }),
    filter: PropTypes.shape({
        blocks: PropTypes.func,
        buttons: PropTypes.func,
        formats: PropTypes.func,
    }),
    fonts: PropTypes.object,
    formats: PropTypes.object,
    hotkeys: PropTypes.object,
    id: PropTypes.string,
    include: PropTypes.shape({
        blocks: PropTypes.array,
        buttons: PropTypes.array,
        formats: PropTypes.array,
    }),
    name: PropTypes.string,
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    panel: PropTypes.bool,
    placeholder: PropTypes.string,
    plugins: PropTypes.object,
    sidebar: PropTypes.bool,
    spellCheck: PropTypes.bool,
    tabs: PropTypes.object,
    toolbar: PropTypes.bool,
    value: PropTypes.object,
};

RichTextEditor.defaultProps = {
    autoFocus: true,
    exclude: {
        blocks: [],
        buttons: [],
        formats: [],
    },
    filter: {},
    id: uuid(),
    include: {
        blocks: [],
        buttons: [],
        formats: [],
    },
    name: 'content',
    namespace: 'ar-rte',
    onChange: noop,
    onFocus: noop,
    panel: true,
    placeholder: 'Enter content...',
    sidebar: true,
    spellCheck: true,
    toolbar: true,
    value: {
        children: [
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
        ],
    },
};

export { RTEPlugin, RichTextEditor as default };
