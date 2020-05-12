import React, { useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Alert, Icon, Dialog } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';
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
    } = props;

    const onReorder = reordered => {
        const currentItemsById = _.indexBy(items, 'id');
        const newItems = _.compact(
            reordered.map(({ key, depth = 0 }) => ({
                ...currentItemsById[key],
                depth,
            })),
        ).map((item, idx, items) => ({
            ...item,
            depth: Math.min(
                op.get(items, [idx - 1, 'depth'], 0) + 1,
                item.depth,
            ),
        }));

        if (
            items.length !== newItems.length ||
            !_.isEqual(_.pluck(items, 'id'), _.pluck(newItems, 'id')) ||
            !_.isEqual(_.pluck(items, 'depth'), _.pluck(newItems, 'depth'))
        ) {
            setItems(newItems);
        }
    };

    return (
        <MenuList
            onReorder={onReorder}
            items={items.map(item => ({
                ...item,
                MenuItem: op.get(itemTypes, [item.type, 'MenuItem']),
            }))}
            onRemoveItem={onRemoveItem}
        />
    );
};

const MenuEditor = props => {
    const namespace = op.get(props, 'namespace', 'menu-editor');
    const [items, setItems] = useState([]);

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

    const renderEditor = () => (
        <Dialog
            className={'menu-dialog'}
            header={{ title: __('Menu') }}
            pref={`menu-dialog-${props.fieldId}`}>
            {items.length < 1 && (
                <div className={'p-xs-20'}>
                    <Alert
                        dismissable={false}
                        color={Alert.ENUMS.COLOR.INFO}
                        icon={<Icon name={'Feather.Flag'} />}>
                        {__('Add Menu Item to begin menu.')}
                    </Alert>
                </div>
            )}
            <div className={'m-xs-20'}>
                <Menu
                    {...props}
                    items={items}
                    setItems={setItems}
                    itemTypes={_.indexBy(itemTypes, 'id')}
                    onRemoveItem={removeItem}
                />
            </div>
        </Dialog>
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
};

export default MenuEditor;
