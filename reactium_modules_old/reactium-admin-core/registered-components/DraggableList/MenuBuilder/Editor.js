import React, { useRef, useState, useEffect, memo } from 'react';
import { Alert, Icon } from 'reactium-ui';
import Reactium, {
    __,
    useHookComponent,
    useAsyncEffect,
} from 'reactium-core/sdk';
import MenuList from './MenuList';
import _ from 'underscore';
import op from 'object-path';
import cn from 'classnames';

const noop = () => {};
const Menu = props => {
    const {
        items = [],
        setItems = noop,
        onRemoveItem = noop,
        onUpdateItem = noop,
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
                onUpdateItem={onUpdateItem}
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

    const updateItem = item => {
        setItems(
            items.map(current => {
                if (current.id !== item.id) return current;
                return {
                    ...current,
                    item,
                };
            }),
        );
    };

    const ElementDialog = useHookComponent('ElementDialog');
    const itemTypes = Reactium.MenuBuilder.ItemType.list || [];
    const cx = Reactium.Utils.cxFactory(namespace);

    const clean = e => {
        const formValue = op.get(e.value, [fieldName], {});
        setValue(formValue);
    };

    const save = async statusEvt => {
        const currentValue = getValue();
        const formValue = op.get(statusEvt, ['value', fieldName], {});

        const saveItems = mapFieldsToItems(op.get(currentValue, 'items', []));
        await new Promise(async resolve => {
            for (const item of saveItems) {
                Reactium.Hook.runSync('menu-build-item-save', fieldName, item);
                await Reactium.Hook.run(
                    'menu-build-item-save',
                    fieldName,
                    item,
                );
            }

            resolve();
        });

        op.set(statusEvt, ['value', fieldName], {
            ...formValue,
            items: saveItems,
        });
    };

    useEffect(() => {
        props.editor.addEventListener('clean', clean);
        props.editor.addEventListener('save-success', clean);
        return () => {
            props.editor.removeEventListener('clean', clean);
            props.editor.removeEventListener('save-success', clean);
        };
    }, [props.editor]);

    useAsyncEffect(async isMounted => {
        const saveId = Reactium.Hook.register(
            'form-editor-status',
            async (statusEvt, type, handle) => {
                if (statusEvt.event === 'SAVE' && isMounted()) {
                    await save(statusEvt, type, handle);
                }
            },
        );

        return () => Reactium.Hook.unregister(saveId);
    });

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
                    onUpdateItem={updateItem}
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
