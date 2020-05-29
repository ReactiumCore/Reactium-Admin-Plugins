import React, { useRef, useState, useEffect, memo } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Alert, Icon, Dialog } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';
import SDK from '@atomic-reactor/reactium-sdk-core';
import MenuList from './MenuList';
import _ from 'underscore';
import op from 'object-path';
import cn from 'classnames';
import uuid from 'uuid/v4';

const noop = () => {};
const Menu = props => {
    const {
        items = [],
        setItems = noop,
        onRemoveItem = noop,
        itemTypes = {},
        fieldName,
        editor,
    } = props;

    const onReorder = (reordered = []) => {
        const currentItemsById = _.indexBy(items, 'id');
        const newItems = _.compact(
            reordered.map(({ key, depth = 0 }) => ({
                ...currentItemsById[key],
                depth,
            })),
        ).map((item, idx, items) => {
            const depth =
                idx > 0
                    ? // children are at most 1 deeper than parent
                      Math.min(
                          op.get(items, [idx - 1, 'depth'], 0) + 1,
                          item.depth,
                      )
                    : // top-most parent must be depth 0
                      0;

            return {
                ...item,
                depth,
            };
        });

        if (
            items.length !== newItems.length ||
            !_.isEqual(_.pluck(items, 'id'), _.pluck(newItems, 'id')) ||
            !_.isEqual(_.pluck(items, 'depth'), _.pluck(newItems, 'depth'))
        ) {
            setItems(newItems);
        }
    };

    return (
        <div className='menu-list-wrapper'>
            <MenuList
                fieldName={fieldName}
                editor={editor}
                onReorder={onReorder}
                items={items.map(item => ({
                    ...item,
                    MenuItem: op.get(itemTypes, [item.type, 'MenuItem']),
                }))}
                onRemoveItem={onRemoveItem}
            />
        </div>
    );
};

const areEqual = (pv, nx) => {
    return pv.editor === nx.editor && pv.fieldName === nx.fieldName;
};

const MenuEditor = memo(props => {
    const fieldName = op.get(props, 'fieldName');
    const namespace = op.get(props, 'namespace', 'menu-editor');
    const [value, _setValue] = useState(
        op.get(props.editor, ['value', fieldName], { items: [] }),
    );
    const valueRef = useRef(value);

    const setValue = value => {
        valueRef.current = value;
        _setValue(value);
    };

    const getValue = () => valueRef.current;

    const items = op.get(value, 'items', []);

    const mapFieldsToItems = items => {
        const fieldVal = op.get(
            props.editor.EventForm.getValue(),
            [fieldName],
            {},
        );

        return items.map(item => {
            const id = item.id;
            if (op.has(fieldVal, [id])) {
                return {
                    ...item,
                    ...op.get(fieldVal, [id]),
                };
            }

            return item;
        });
    };

    const setItems = items => {
        const fieldVal = op.get(
            props.editor.EventForm.getValue(),
            [fieldName],
            {},
        );

        const newValue = {
            ...value,
            ...fieldVal,
            items: mapFieldsToItems(items),
        };

        setValue(newValue);
        _.defer(() => props.editor.setValue({ [fieldName]: newValue }));
    };

    const addItems = item => {
        const added = _.flatten([item]);
        setItems(items.concat(added));
    };

    const removeItem = ({ id }) => () => {
        setItems(items.filter(item => item.id !== id));
    };

    const ElementDialog = useHookComponent('ElementDialog');
    const itemTypes = Reactium.MenuBuilder.ItemType.list || [];
    const cx = Reactium.Utils.cxFactory(namespace);

    const clean = e => {
        const formValue = op.get(e.value, [fieldName], {});
        setValue(formValue);
    };

    const save = e => {
        const currentValue = getValue();
        const formValue = op.get(e.value, [fieldName], {});

        op.set(e.value, [fieldName], {
            ...formValue,
            items: mapFieldsToItems(op.get(currentValue, 'items', [])),
        });
    };

    useEffect(() => {
        props.editor.addEventListener('save', save);
        props.editor.addEventListener('clean', clean);
        return () => {
            props.editor.addEventListener('save', save);
            props.editor.addEventListener('clean', clean);
        };
    }, [props.editor]);

    const renderEditor = () => (
        <div className={'menu-container'}>
            {items.length < 1 && (
                <div className={'px-xs-20'}>
                    <Alert
                        dismissable={false}
                        color={Alert.ENUMS.COLOR.INFO}
                        icon={<Icon name={'Feather.Flag'} />}>
                        {__('Add Menu Item to begin menu.')}
                    </Alert>
                </div>
            )}
            <div className={'menu'}>
                <Menu
                    {...props}
                    items={items}
                    setItems={setItems}
                    itemTypes={_.indexBy(itemTypes, 'id')}
                    onRemoveItem={removeItem}
                />
            </div>
        </div>
    );

    const renderControls = () => {
        return itemTypes.map(itemType => {
            const Control = op.get(itemType, 'Control', () => null);
            return (
                <Control
                    key={itemType.id}
                    itemType={itemType}
                    cx={cx}
                    onAddItems={addItems}
                    {...props}
                />
            );
        });
    };

    const render = () => {
        return (
            <ElementDialog {...props}>
                <div className={cn(cx(), 'row')}>
                    <div className={cn(cx('controls'), 'col-xs-12 col-sm-4')}>
                        {renderControls()}
                    </div>
                    <div className={cn(cx('items'), 'col-xs-12 col-sm-8')}>
                        {renderEditor()}
                    </div>
                </div>
            </ElementDialog>
        );
    };

    return render();
}, areEqual);

export default MenuEditor;
