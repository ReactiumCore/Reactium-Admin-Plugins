import React, { useEffect } from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import isHotkey from 'is-hotkey';
import PropTypes from 'prop-types';
import { Transforms } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';
import { Button, Dialog, Icon } from '@atomic-reactor/reactium-ui';
import { Scrollbars } from 'react-custom-scrollbars';

import Reactium, {
    __,
    useDerivedState,
    useFocusEffect,
    useRefs,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */
const CloseButton = props => (
    <Button
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.CLEAR}
        className='ar-dialog-header-btn dismiss'
        {...props}>
        <Icon name='Feather.X' />
    </Button>
);

const Panel = ({ submitButtonLabel, namespace, title, ...props }) => {
    const refs = useRefs();
    const editor = useEditor();

    // Initial state
    const [state, setState] = useDerivedState({
        max: 12,
        min: 1,
        id: op.get(props, 'id', uuid()),
        columns: JSON.parse(JSON.stringify(op.get(props, 'columns', []))),
        node: op.get(props, 'node'),
        path: op.get(props, 'path'),
        selection: editor.selection,
        sizes: ['xs', 'sm', 'md', 'lg'],
    });

    // className prefixer
    const cx = Reactium.Utils.cxFactory(namespace);

    const submit = e => {
        if (e) e.preventDefault();
        if (op.get(state, 'node')) {
            updateNode(e);
        } else {
            insertNode(e);
        }
    };

    const insertNode = () => {
        const { columns = [], id } = state;

        const nodes = columns.map((col, i) => ({
            addAfter: false,
            addBefore: false,
            blocked: true,
            children: [
                {
                    type: 'block',
                    blocked: true,
                    deletable: false,
                    inspector: false,
                    data: { column: col },
                    id: `block-inner-${id}-${i}`,
                    children: [{ type: 'p', children: [{ text: '' }] }],
                },
            ],
            className: Object.entries(col)
                .map(([size, val]) => `col-${size}-${val}`)
                .join(' '),
            column: col,
            deletable: false,
            id: `block-${id}-${i}`,
            type: 'block',
        }));

        Transforms.select(editor, state.selection.anchor.path);
        Reactium.RTE.insertBlock(editor, nodes, {
            id,
            className: 'row',
            inspector: true,
            row: columns,
        });

        hide();
    };

    const updateNode = () => {
        const { columns = [], id, node, path } = state;
        if (columns.length < 1) return;

        let children = op.get(node, 'children', []);

        // Add/Remove columns if needed
        const diff = columns.length - children.length;

        if (diff > 0) {
            const at = _.flatten([path, columns.length - 1]);
            const cols = columns.slice(columns.length - diff);

            const nodes = cols.map((col, i) => ({
                addAfter: false,
                addBefore: false,
                blocked: true,
                children: [
                    {
                        type: 'block',
                        blocked: true,
                        deletable: false,
                        inspector: false,
                        data: { column: col },
                        id: `block-inner-${id}-${i}`,
                        children: [{ type: 'p', children: [{ text: '' }] }],
                    },
                ],
                className: Object.entries(col)
                    .map(([size, val]) => `col-${size}-${val}`)
                    .join(' '),
                column: col,
                deletable: false,
                id: `block-${id}-${i}`,
                type: 'block',
            }));

            Transforms.insertNodes(editor, nodes, { at });
            Transforms.select(editor, at);
        }

        if (diff < 0) {
            const orig = _.range(children.length);
            const indices = _.range(children.length + Math.abs(diff));
            _.without(indices, ...orig).forEach(i =>
                Transforms.delete(editor, { at: _.flatten([path, i - 1]) }),
            );
        }

        // Update the row element
        Transforms.setNodes(editor, { row: columns }, { at: path });

        columns.forEach((col, i) => {
            if (!col) return;

            const cpath = _.flatten([path, i]);
            const className = Object.entries(col)
                .map(([size, val]) => `col-${size}-${val}`)
                .join(' ');

            Transforms.setNodes(
                editor,
                { className, column: col },
                { at: cpath },
            );
        });

        hide();
    };

    const _onChange = (e, { index, size }) => {
        const { columns = [] } = state;
        op.set(columns, [index, size], e.target.value);
        setState({ columns });
    };

    const _onColumnAdd = e => {
        if (e.type === 'keydown') {
            if (!isHotkey('enter', e)) return;
            e.preventDefault();
        }

        const { columns = [] } = state;

        const values = Object.values(refs.get('size')).reduce(
            (output, input) => {
                if (!_.isEmpty(input.value)) {
                    op.set(output, input.name, Number(input.value));
                }

                input.value = '';
                return output;
            },
            {},
        );

        const firstInput = refs.get('size.xs');
        if (firstInput) firstInput.focus();

        columns.push(values);

        setState({ columns });
    };

    const _onColumnDelete = index => {
        const { columns = [] } = state;
        columns.splice(index, 1);
        setState({ columns });
    };

    const hide = () => {
        editor.panel.hide(true, true).setID('rte-panel');
        ReactEditor.focus(editor);
    };

    const header = () => ({
        elements: [<CloseButton onClick={hide} key='close-btn' />],
        title,
    });

    useFocusEffect(editor.panel.container);

    useEffect(() => {
        if (!editor.selection) return;
        setState({
            selection: editor.selection,
            columns: JSON.parse(
                JSON.stringify(
                    op.get(props, 'columns', op.get(state, 'columns', [])),
                ),
            ),
        });
    }, [editor.selection]);

    // Renderers
    return (
        <Dialog collapsible={false} dismissable={false} header={header()}>
            <div className={cx('form')}>
                <h4>
                    {__('Column %num').replace(
                        /\%num/gi,
                        state.columns.length + 1,
                    )}
                </h4>
                <div className='input-group'>
                    {state.sizes.map(size => (
                        <input
                            key={`col-size-${size}`}
                            type='number'
                            placeholder={size}
                            onKeyDown={_onColumnAdd}
                            name={size}
                            data-focus={size === 'xs'}
                            max={state.max}
                            min={state.min}
                            ref={elm => refs.set(`size.${size}`, elm)}
                        />
                    ))}
                    <Button
                        color={Button.ENUMS.COLOR.TERTIARY}
                        onClick={_onColumnAdd}
                        type='button'
                        size='sm'>
                        <Icon name='Feather.Plus' size={20} />
                    </Button>
                </div>
            </div>
            {state.columns.length > 0 && (
                <div style={{ height: '50vh', minHeight: 200 }}>
                    <Scrollbars>
                        {state.columns.map((column, i) => (
                            <div className={cx('col')} key={`row-${i}`}>
                                <div className='input-group'>
                                    {state.sizes.map(size => (
                                        <input
                                            key={`row-${i}-${size}`}
                                            type='number'
                                            placeholder={size}
                                            name={size}
                                            max={state.max}
                                            min={state.min}
                                            onChange={e =>
                                                _onChange(e, { index: i, size })
                                            }
                                            value={op.get(column, size, '')}
                                            ref={elm =>
                                                refs.set(
                                                    `column.${i}.${size}`,
                                                    elm,
                                                )
                                            }
                                        />
                                    ))}
                                    <Button
                                        onClick={() => _onColumnDelete(i)}
                                        type='button'
                                        color={Button.ENUMS.COLOR.DANGER}
                                        size='sm'>
                                        <Icon name='Feather.X' size={18} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </Scrollbars>
                </div>
            )}

            {state.columns.length > 0 && (
                <div className={cx('footer')}>
                    <Button block color='tertiary' size='md' onClick={submit}>
                        {submitButtonLabel}
                    </Button>
                </div>
            )}
        </Dialog>
    );
};

Panel.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    removeButtonLabel: PropTypes.node,
    submitButtonLabel: PropTypes.node,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'rte-grid-panel',
    submitButtonLabel: __('Apply Grid'),
    title: __('Grid'),
};

export { Panel as default };
