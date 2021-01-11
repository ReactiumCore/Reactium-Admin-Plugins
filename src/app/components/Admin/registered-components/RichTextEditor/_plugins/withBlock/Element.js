import React from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import { ReactEditor, useEditor } from 'slate-react';
import { Editor, Node, Path, Transforms } from 'slate';

import Reactium, {
    __,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useRefs,
    Zone,
} from 'reactium-core/sdk';

const showDialog = ({ editor, id }, Component) => {
    const x = window.innerWidth / 2 - 150;
    const y = 50;
    editor.panel
        .setID(id)
        .setContent(Component)
        .moveTo(x, y)
        .show();
};

const Element = ({ children, ...initialProps }) => {
    const node = op.get(children, 'props.node', {});

    const {
        id,
        addAfter = true,
        addBefore = true,
        blocked,
        className,
        column = false,
        deletable = true,
        type = 'block',
        nodeProps,
    } = node;

    const props = { ...initialProps, node };

    const editor = useEditor();

    const refs = useRefs({});

    const { Alert, Button, Icon, Toast } = useHookComponent('ReactiumUI');

    const [state, updateState] = useDerivedState({
        blocked,
        confirm: false,
        type,
    });

    const setState = newState => {
        if (unMounted()) return;
        updateState(newState);
    };

    const cx = Reactium.Utils.cxFactory(type);

    const clone = elements =>
        React.Children.map(React.Children.toArray(elements), element =>
            React.cloneElement(element, { block: handle }),
        );

    const _add = above => {
        let { selection } = getNode();
        selection = Array.from(selection);

        const path = above ? selection : Path.next(selection);

        Transforms.insertNodes(
            editor,
            {
                blocked: true,
                id: `block-${uuid()}`,
                type: 'block',
                children: [{ type: 'p', children: [{ text: '' }] }],
            },
            {
                at: path,
            },
        );

        Transforms.select(editor, path);
        Transforms.collapse(editor, { edge: 'end' });
        ReactEditor.focus(editor);
    };

    const _cancel = () => setState({ confirm: false });

    const _copy = (silent = false) => {
        const { node } = getNode();

        if (silent !== true) {
            Toast.show({
                type: Toast.TYPE.INFO,
                message: __('Copied to clipboard!'),
                icon: (
                    <Icon
                        name='Feather.Clipboard'
                        style={{ marginRight: 12 }}
                    />
                ),
            });
        }

        return Reactium.RTE.copy(node);
    };

    const _delete = confirmed => {
        Transforms.collapse(editor, { edge: 'end' });

        const { node, selection } = getNode();

        if (node && !isEmpty(node) && confirmed !== true) {
            setState({ confirm: true });
            return;
        }

        if (selection.length === 1 && editor.children.length === 1) {
            Transforms.insertNodes(
                editor,
                {
                    type: 'p',
                    children: [{ text: '' }],
                },
                { at: Path.next(selection) },
            );
        }

        if (node && selection.length > 0) {
            Transforms.delete(editor, { at: selection });
        }
    };

    const _duplicate = () => {
        const { node, selection } = getNode();
        Reactium.RTE.clone(editor, node, selection);
        ReactEditor.focus(editor);
    };

    const _zoneInclude = zone =>
        _.sortBy(
            Object.values(Reactium.RTE.actions).filter(item => {
                if (!zone) return true;
                const zones = op.get(item, 'zones', []);
                if (zones.length < 1) return true;
                return zones.includes(zone);
            }),
            'order',
        );

    const getNode = () => {
        const { type } = state;
        const nodes = Array.from(Editor.nodes(editor, { at: [] }));
        nodes.reverse();

        if (nodes.length < 1) return;

        const result = nodes.reduce((output, [node, selection]) => {
            if (!op.get(node, 'id') || !op.get(node, 'type')) return output;
            if (
                op.get(node, 'id') === id &&
                op.get(node, 'type') === type &&
                !output
            ) {
                output = { node, selection };
            }

            return output;
        }, null);

        return result ? result : { node: null, selection: [] };
    };

    const isEmpty = node => {
        node = node || op.get(getNode(), 'node');
        return !node ? true : String(Node.string(node)).length < 1;
    };

    const unMounted = () => !refs.get('block.container');

    const _handle = () => ({
        cancel: _cancel,
        className,
        copy: _copy,
        cx,
        delete: _delete,
        duplicate: _duplicate,
        id,
        isEmpty,
        node: getNode,
        props,
        refs,
        setHandle,
        setState,
        showDialog,
        state,
        type,
        unMounted,
        zone: `${id}-toolbar`,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    let elmProps = { ...props };
    op.del(elmProps, 'node');

    return (
        <div
            {...elmProps}
            type={state.type}
            ref={elm => refs.set('block.container', elm)}
            className={cn(cx(), className, { column: !!column })}>
            <div contentEditable={false}>
                {state.confirm && deletable && (
                    <Alert
                        dismissable={false}
                        color={Alert.ENUMS.COLOR.DANGER}
                        className='mb-xs-16'
                        icon={<Icon name='Feather.AlertOctagon' />}>
                        <div className='text-center'>
                            {__('The current section is not empty')}
                            <br />
                            <Button
                                size='sm'
                                outline
                                color={Button.ENUMS.COLOR.DANGER}
                                className='mx-xs-4 my-xs-16'
                                onClick={() => _cancel()}>
                                {__('Cancel')}
                            </Button>
                            <Button
                                size='sm'
                                color={Button.ENUMS.COLOR.DANGER}
                                className='mx-xs-4 my-xs-16'
                                onClick={() => _delete(true)}>
                                {__('Delete')}
                            </Button>
                        </div>
                    </Alert>
                )}
                {addBefore && (
                    <div className='add before'>
                        <Button
                            appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                            onClick={() => _add(true)}>
                            <Icon name='Feather.Plus' />
                        </Button>
                    </div>
                )}
                {addAfter && (
                    <div className='add after'>
                        <Button
                            appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                            onClick={() => _add()}>
                            <Icon name='Feather.Plus' />
                        </Button>
                    </div>
                )}
                {!state.confirm && (
                    <>
                        <div className={cx('actions-left')}>
                            <Zone
                                node={node}
                                editor={editor}
                                handle={handle}
                                zone='block-actions-left'
                            />
                            {_zoneInclude('block-actions-left').map(
                                ({ Component, id }) => (
                                    <Component
                                        node={node}
                                        editor={editor}
                                        handle={handle}
                                        zone='block-actions'
                                        key={`block-actions-${id}`}
                                    />
                                ),
                            )}
                        </div>
                        <div className={cx('actions-right')}>
                            <Zone
                                node={node}
                                editor={editor}
                                handle={handle}
                                zone='block-actions-right'
                            />
                            {_zoneInclude('block-actions-right').map(
                                ({ Component, id }) => (
                                    <Component
                                        node={node}
                                        editor={editor}
                                        handle={handle}
                                        zone='block-actions'
                                        key={`block-actions-${id}`}
                                    />
                                ),
                            )}
                        </div>
                    </>
                )}
            </div>
            <div className={cx('content')} {...nodeProps}>
                {clone(children)}
            </div>
        </div>
    );
};

export default Element;
