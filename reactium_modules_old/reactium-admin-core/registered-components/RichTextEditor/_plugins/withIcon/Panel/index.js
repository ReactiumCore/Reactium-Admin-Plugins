import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Transforms } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';
import React, { useEffect, useRef, useState } from 'react';
import { __, useFocusEffect, useHookComponent } from 'reactium-core/sdk';
import { Button, Dialog, Icon } from 'reactium-ui';

const CloseButton = props => (
    <Button
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.CLEAR}
        className='ar-dialog-header-btn dismiss'
        {...props}>
        <Icon name='Feather.X' />
    </Button>
);

const Panel = ({
    onDismiss,
    onSelect,
    selection: initialSelection,
    title,
    ...props
}) => {
    const pickerRef = useRef();

    const editor = useEditor();

    const IconPicker = useHookComponent('IconPicker');

    const [header, setNewHeader] = useState();

    const [selection, setSelection] = useState(initialSelection);

    const cx = cls =>
        _.chain([op.get(props, 'className', op.get(props, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const hide = () => {
        if (onDismiss) return onDismiss();

        editor.panel.hide(false, true).setID('rte-panel');
        ReactEditor.focus(editor);
    };

    const insertNode = icon => {
        const { color, size } = pickerRef.current;
        const children = [{ text: '' }];
        const id = uuid();
        const node = {
            id,
            children,
            color,
            icon,
            size,
            nodeProps: {
                name: icon,
                size,
                style: {
                    fill: color,
                    width: size,
                    height: size,
                },
            },
            type: 'icon',
        };

        Transforms.insertNodes(editor, node, { at: selection });
    };

    const _search = value => pickerRef.current.setSearch(value);
    const search = _.throttle(_search, 100);

    const setHeader = () =>
        setNewHeader({
            elements: [<CloseButton onClick={hide} key='close-button' />],
            title,
        });

    const _size = value => pickerRef.current.setSize(Number(value || 24));
    const size = _.throttle(_size, 100);

    const _onSelect = e => {
        if (typeof onSelect === 'function') return onSelect(e);

        insertNode(e.item);
        // pickerRef.current.setValue([]);
        // hide();
    };

    useEffect(() => {
        if (!header) setHeader();
    }, [header]);

    useEffect(() => {
        if (!editor.selection) return;
        setSelection(editor.selection);
    }, [editor.selection]);

    useEffect(() => {
        if (!initialSelection) return;
        setSelection(initialSelection);
    }, [initialSelection]);

    useFocusEffect(editor.panel.container);

    const render = () => {
        return (
            <Dialog collapsible={false} dismissable={false} header={header}>
                <div className={cx()}>
                    <div className={cx('search')}>
                        <div className='form-group'>
                            <div className='input-group'>
                                <input
                                    type='number'
                                    placeholder='size'
                                    min={18}
                                    defaultValue={18}
                                    onFocus={e => e.target.select()}
                                    onChange={e => size(e.target.value)}
                                />
                                <input
                                    data-focus
                                    type='search'
                                    placeholder='search'
                                    className='grow'
                                    onFocus={e => e.target.select()}
                                    onChange={e => search(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <IconPicker
                        ref={pickerRef}
                        onSelect={_onSelect}
                        height={250}
                    />
                </div>
            </Dialog>
        );
    };

    return render();
};

Panel.propTypes = {
    namespace: PropTypes.string,
    onDismiss: PropTypes.string,
    onSelect: PropTypes.func,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'rte-icons',
    title: __('Icons'),
};

export { Panel as default };
