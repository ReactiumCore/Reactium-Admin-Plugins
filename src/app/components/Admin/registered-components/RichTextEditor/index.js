import Leaf from './Leaf';
import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';
import op from 'object-path';
import Element from './Element';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import ReactDOM from 'react-dom';
import Plugin from './RTEPlugin';
import PropTypes from 'prop-types';
import { createEditor } from 'slate';
import { Slate, Editable } from 'slate-react';
import Reactium, { useDerivedState } from 'reactium-core/sdk';

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    useEditorBlocks,
    useEditorFormats,
    useEditorPlugins,
    useEditorTypes,
    useEventHandle,
    useSelectProps,
} from './_utils';

const noop = () => {};

const RichTextEditor = forwardRef((initialProps, ref) => {
    // 0.0 - Get props
    const {
        className,
        id,
        name,
        namespace,
        onChange,
        onFocus,
        blocks: initialBlocks,
        formats: initialFormats,
        plugins: initialPlugins,
        types: initialTypes,
        ...props
    } = useSelectProps({ props: initialProps, exclude: ['value'] });

    // 0.1 - References
    const containerRef = useRef();

    // 1.0 - Must be called before editor is created
    const [plugins, setPlugins] = useEditorPlugins(initialPlugins);
    const [types, setTypes] = useEditorTypes(initialTypes || plugins);

    // 2.0 - Must be called after plugin aggregation
    const editor = useMemo(() => {
        let editor = createEditor();
        const _plugins = _.pluck(Object.values(plugins), 'plugin');

        _plugins.forEach(plugin => {
            editor = plugin(editor);
        });

        const { isVoid } = editor;

        editor.isVoid = element =>
            types.includes(element.type) ? true : isVoid(element);

        return editor;
    }, [blocks, formats, plugins, types]);

    // 3.0 - Editor component aggregation
    const [blocks, setBlocks] = useEditorBlocks(
        initialBlocks || Reactium.RTE.blocks,
    );

    const [formats, setFormats] = useEditorFormats(
        initialFormats || Reactium.RTE.formats,
    );

    // 4.0 - Editor value
    const [value, setValue] = useState(op.get(initialProps, 'value'));

    // 5.0 - Component state
    const [state, setState] = useDerivedState({
        ...props,
        change: 0,
        id,
    });

    // 6.0 - Handlers
    const _onChange = newValue => setValue(newValue);

    const _onKeyDown = e => Reactium.RTE.hotKey(editor, e);

    // 7.0 - Renderers
    const _renderElement = useCallback(
        props => <Element {...props} {...handle} />,
        [blocks],
    );

    const _renderLeaf = useCallback(props => <Leaf {...props} {...handle} />, [
        formats,
    ]);

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
        blocks,
        editor,
        formats,
        id,
        name,
        nodes,
        plugins,
        props,
        setBlocks,
        setFormats,
        setPlugins,
        setState,
        setTypes,
        setValue,
        state,
        value,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    // 10.0 - Side effects
    // 10.1 - Handle update.
    useEffect(() => {
        setState({ updated: Date.now() });
        setHandle(_handle());
    }, [blocks, formats, plugins, value]);

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

    // 11.0 - Render function
    const render = useMemo(() => (
        <div className={cname()} ref={containerRef}>
            <input type='hidden' name={name} value={JSON.stringify(value)} />
            <Slate editor={editor} onChange={_onChange} value={value}>
                <Editable
                    {...props}
                    onKeyDown={_onKeyDown}
                    renderElement={_renderElement}
                    renderLeaf={_renderLeaf}
                />
                <Toolbar {...handle} className={cx('toolbar')} />
                <Sidebar {...handle} className={cx('sidebar')} />
            </Slate>
        </div>
    ));

    return render;
});

RichTextEditor.propTypes = {
    autoFocus: PropTypes.bool,
    blocks: PropTypes.object,
    className: PropTypes.string,
    formats: PropTypes.object,
    id: PropTypes.string,
    name: PropTypes.string,
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    placeholder: PropTypes.string,
    plugins: PropTypes.object,
    spellCheck: PropTypes.bool,
    types: PropTypes.func,
    value: PropTypes.array,
};

RichTextEditor.defaultProps = {
    autoFocus: true,
    id: 'rte',
    name: 'content',
    namespace: 'ar-rte',
    onChange: noop,
    onFocus: noop,
    placeholder: 'Enter content...',
    spellCheck: true,
    value: [
        {
            type: 'paragraph',
            children: [
                {
                    text: 'Lorem ipsum dolor sit amet ',
                },
                {
                    text: 'vero eos et accusamus',
                    bold: true,
                },
                {
                    text: ' et iusto odio dignissimos ducimus qui blanditiis',
                },
            ],
        },
    ],
};

export { Plugin, RichTextEditor as default };
