import React, { useEffect } from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import isHotkey from 'is-hotkey';
import PropTypes from 'prop-types';
import { Editor, Path, Transforms } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';
import { Button, Dialog, Icon } from '@atomic-reactor/reactium-ui';

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

const Panel = ({ submitButtonLabel, namespace, title }) => {
    const refs = useRefs();
    const editor = useEditor();

    // Initial state
    const [state, setState] = useDerivedState({
        max: 12,
        min: 1,
        columns: [],
        selection: editor.selection,
        sizes: ['xs', 'sm', 'md', 'lg'],
    });

    // className prefixer
    const cx = Reactium.Utils.cxFactory(namespace);

    const insertNode = e => {
        if (e) e.preventDefault();

        const id = uuid();
        const { columns = [] } = state;
        const nodes = columns.map((col, i) => ({
            addAfter: false,
            addBefore: false,
            blocked: true,
            children: [
                {
                    type: 'div',
                    data: { column: col },
                    children: [{ text: '' }],
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
            row: columns,
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
        editor.panel.hide(true).setID('rte-panel');
        ReactEditor.focus(editor);
    };

    const header = () => ({
        elements: [<CloseButton onClick={hide} key='close-btn' />],
        title,
    });

    useFocusEffect(editor.panel.container);

    useEffect(() => {
        if (!editor.selection) return;
        setState({ selection: editor.selection, columns: [] });
    }, [editor.selection]);

    // Renderers
    return (
        <Dialog collapsible={false} dismissable={false} header={header()}>
            {state.columns.length < 12 && (
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
            )}
            {state.columns.length > 0 &&
                state.columns.map((column, i) => (
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
                                        refs.set(`column.${i}.${size}`, elm)
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

            {state.columns.length > 0 && (
                <div className={cx('footer')}>
                    <Button
                        block
                        color='tertiary'
                        size='md'
                        onClick={insertNode}>
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
    submitButtonLabel: __('Insert Grid'),
    title: __('Grid'),
};

export { Panel as default };
