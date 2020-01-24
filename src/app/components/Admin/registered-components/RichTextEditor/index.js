import Leaf from './Leaf';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import uuid from 'uuid/v4';
import ENUMS from './enums';
import Element from './Element';
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
    useSelectProps,
} from './_utils';

const noop = () => {};

class ComponentTarget extends EventTarget {
    constructor(handle) {
        super();
        this.update = handle => {
            Object.entries(handle).forEach(
                ([key, value]) => (this[key] = value),
            );
        };

        this.update(handle);
    }
}

const RichTextEditor = forwardRef((initialProps, ref) => {
    const {
        className,
        id,
        namespace,
        onChange,
        onFocus,
        ...props
    } = useSelectProps({ props: initialProps, exclude: ['value'] });

    // 1.0 - Must be called before editor is created
    const [plugins, setPlugins] = useEditorPlugins();

    // 2.0 - Must be called after plugin aggregation
    const editor = useMemo(() => {
        let editor = createEditor();

        plugins.forEach(plugin => {
            editor = plugin(editor);
        });

        const { isVoid } = editor;

        editor.isVoid = element =>
            types.includes(element.type) ? true : isVoid(element);

        return editor;
    }, [blocks, formats, plugins, types]);

    // 3.0 - Editor component aggregation
    const [blocks, setBlocks] = useEditorBlocks();
    const [formats, setFormats] = useEditorFormats();
    const [types, setTypes] = useEditorTypes();
    const [UUID, setUUID] = useState(uuid());

    // 4.0 - Editor value
    const [value, setValue] = useState(op.get(initialProps, 'value'));

    // 5.0 - Component state
    const [state, setState] = useDerivedState({
        ...props,
        change: 0,
        id,
    });

    // 6.0 - Handle
    const _handle = () => ({
        UUID,
        blocks,
        editor,
        formats,
        id,
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

    const [handle] = useState(new ComponentTarget(_handle()));
    useImperativeHandle(ref, () => handle);

    // 7.0 - Handlers
    const _onChange = newValue => setValue(newValue);

    const _onKeyDown = e => Reactium.RTE.hotKey(editor, e);

    // 8.0 - Renderers
    const _renderElement = useCallback(
        props => <Element {...props} {...handle} />,
        [blocks],
    );

    const _renderLeaf = useCallback(props => <Leaf {...props} {...handle} />, [
        formats,
    ]);

    // 9.0 - Utilites
    const cname = () => {
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    const cx = cls => _.uniq([namespace, cls]).join('-');

    // 10.0 - Side effects
    useEffect(() => {
        handle.update(_handle());
        handle.dispatchEvent(new Event('change'));

        onChange({
            type: 'change',
            target: handle,
            currentTarget: editor,
        });
    }, [value]);

    // 11.0 - Render function
    const render = useMemo(() => {
        return (
            <div className={cname()}>
                <Slate editor={editor} onChange={_onChange} value={value}>
                    <Editable
                        {...props}
                        onKeyDown={_onKeyDown}
                        renderElement={_renderElement}
                        renderLeaf={_renderLeaf}
                    />
                    <Toolbar {...handle} className={cx('toolbar')} />
                </Slate>
            </div>
        );
    });

    return render;
});

RichTextEditor.propTypes = {
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    id: PropTypes.string,
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    placeholder: PropTypes.string,
    spellCheck: PropTypes.bool,
    value: PropTypes.array,
};

RichTextEditor.defaultProps = {
    autoFocus: true,
    id: 'rte',
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
