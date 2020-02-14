import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import isHotkey from 'is-hotkey';
import PropTypes from 'prop-types';
import EventForm from '../../../EventForm';
import { Editor, Transforms } from 'slate';
import Reactium, { __ } from 'reactium-core/sdk';
import { ReactEditor, useEditor } from 'slate-react';
import { Button, Dialog, Icon } from '@atomic-reactor/reactium-ui';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

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

let Panel = (
    {
        submitButtonLabel,
        children,
        selection: initialSelection,
        title,
        ...props
    },
    ref,
) => {
    const addRef = useRef();
    const formRef = useRef();

    const editor = useEditor();

    // Initial state
    const [value, setValue] = useState({
        column: [],
    });

    // className prefixer
    const cx = cls =>
        _.chain([op.get(props, 'className', op.get(props, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const insertNode = () => {
        let children = value.column.map(item => {
            return {
                type: 'col',
                column: item,
                children: [{ type: 'p', text: '' }],
            };
        });

        const node = {
            type: 'row',
            ID: uuid(),
            columns: value.column,
            children,
        };

        const p = {
            type: 'p',
            ID: uuid(),
            children: [{ text: '' }],
        };

        Transforms.insertNodes(editor, node);
        Transforms.insertNodes(editor, p, {
            at: [editor.children.length],
            select: true,
        });
        ReactEditor.focus(editor);
    };

    const _onColumnAdd = e => {
        if (e.type === 'keydown') {
            if (!isHotkey('enter', e)) return;
            e.preventDefault();
        }

        const val = addRef.current.value;
        if (_.isEmpty(_.compact([val]))) return;

        const newColumns = Array.from(op.get(value, 'column', []));
        newColumns.push(val);
        setValue({ column: newColumns });
        addRef.current.value = '';
        addRef.current.focus();
    };

    const _onColumnRemove = e => {
        let index = op.get(e.currentTarget.dataset, 'index');
        if (!index) return;

        index = Number(index);
        const newColumns = Array.from(value.column);
        const removed = newColumns.splice(index, 1);

        setValue({ column: newColumns });
    };

    const _onSubmit = e => {
        if (_.isEmpty(_.compact(_.flatten([op.get(value, 'column')])))) return;
        insertNode();
        setValue({ column: [] });
        hide();
    };

    const _onChange = e => {
        console.log(e.value);
        setValue(e.value);
    };

    const hide = () => {
        editor.panel.hide(false).setID('rte-panel');
        ReactEditor.focus(editor);
    };

    // On submit handler
    useEffect(() => {
        if (!formRef.current) return;
        formRef.current.addEventListener('submit', _onSubmit);

        return () => {
            formRef.current.removeEventListener('submit', _onSubmit);
        };
    }, [editor.selection, value]);

    // Renderers
    const render = useCallback(() => {
        const header = {
            elements: [<CloseButton onClick={hide} />],
            title,
        };

        const columns = op.get(value, 'column', []);

        return (
            <EventForm
                ref={formRef}
                className={cx()}
                value={value}
                onChange={_onChange}>
                <Dialog collapsible={false} dismissable={false} header={header}>
                    <div className='p-xs-20'>
                        <div className='input-group'>
                            <input
                                onKeyDown={_onColumnAdd}
                                placeholder={__('col-xs-12 col-lg-4')}
                                ref={addRef}
                                type='text'
                            />
                            <Button
                                color='tertiary'
                                onClick={_onColumnAdd}
                                type='button'
                                size='sm'
                                style={{ width: 40, padding: 0 }}>
                                <Icon name='Feather.Plus' size={20} />
                            </Button>
                        </div>
                    </div>
                    {columns.map((item, i) => (
                        <div key={cx(i)}>
                            <hr />
                            <div className='px-xs-20 py-xs-12'>
                                <div className='input-group'>
                                    <input
                                        type='text'
                                        name={`column.${i}`}
                                        data-index={Number(i)}
                                    />
                                    <Button
                                        color='danger'
                                        data-index={i}
                                        onClick={_onColumnRemove}
                                        type='button'
                                        size='sm'
                                        style={{ width: 40, padding: 0 }}>
                                        <Icon name='Feather.X' size={20} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <hr />
                    <div className='p-xs-8'>
                        <Button block color='tertiary' size='sm' type='submit'>
                            {submitButtonLabel}
                        </Button>
                    </div>
                </Dialog>
            </EventForm>
        );
    }, [value]);

    return render();
};

Panel = forwardRef(Panel);

Panel.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    removeButtonLabel: PropTypes.node,
    submitButtonLabel: PropTypes.node,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'rte-grid-insert',
    submitButtonLabel: __('Insert Columns'),
    title: __('Grid'),
};

export { Panel as default };
