import React from 'react';
import uuid from 'uuid/v4';
import _ from 'underscore';
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

const Element = ({ children, ...props }) => {
    const {
        id,
        addAfter = true,
        addBefore = true,
        blocked,
        className,
        deletable = true,
        type = 'block',
    } = op.get(children, 'props.node', {});

    const editor = useEditor();

    const refs = useRefs({});

    const { Alert, Button, Icon } = useHookComponent('ReactiumUI');

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
                className: 'full',
                blocked: true,
                id: `block-${uuid()}`,
                type: 'block',
                children: [
                    {
                        type: 'div',
                        children: [{ type: 'p', children: [{ text: '' }] }],
                    },
                ],
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

    const _delete = confirmed => {
        const { node, selection } = getNode();

        if (node && !isEmpty(node) && confirmed !== true) {
            setState({ confirm: true });
            return;
        }

        if (selection.length === 1 && editor.children.length === 1) {
            Transforms.insertNodes(
                editor,
                {
                    type: 'div',
                    children: [{ type: 'p', text: '' }],
                },
                { at: Path.next(selection) },
            );
        }

        if (node && selection.length > 0) {
            Transforms.removeNodes(editor, { at: selection });
        }
    };

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
        cx,
        delete: _delete,
        id,
        isEmpty,
        node: getNode,
        props,
        refs,
        setHandle,
        setState,
        state,
        type,
        unMounted,
        zone: `${id}-toolbar`,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    return (
        <div
            className={cn(cx(), className)}
            ref={elm => refs.set('block.container', elm)}
            type={state.type}
            {...props}>
            <div contentEditable={false} style={{ userSelect: 'none' }}>
                {!state.confirm && (
                    <div className={cx('actions')}>
                        <Zone zone={handle.zone} />
                        {deletable && (
                            <Button
                                color={Button.ENUMS.COLOR.DANGER}
                                onClick={() => _delete()}>
                                <Icon name='Feather.X' size={16} />
                            </Button>
                        )}
                    </div>
                )}
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
            </div>
            <div className={cx('content')}>{clone(children)}</div>
        </div>
    );
};

export default Element;
