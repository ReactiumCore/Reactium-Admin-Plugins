import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Reactium, { useHookComponent } from 'reactium-core/sdk';
import MenuList from './MenuList';
import _ from 'underscore';
import op from 'object-path';
import cn from 'classnames';

// const Editor = props => {
//     const [items, setItems] = useState([]);
//
//     const addItem = () => {
//         setItems(
//             items.concat({
//                 id: items.length,
//                 type: 'something',
//                 depth: items.length,
//             }),
//         );
//     };
//
//     const onReorder = reordered => {
//         const currentItemsById = _.indexBy(items, 'id');
//         const newItems = _.compact(
//             reordered.map(({ key, depth = 0 }) => ({
//                 ...currentItemsById[key],
//                 depth,
//             })),
//         ).map((item, idx, items) => ({
//             ...item,
//             depth: Math.min(
//                 op.get(items, [idx - 1, 'depth'], 0) + 1,
//                 item.depth,
//             ),
//         }));
//
//         if (
//             items.length !== newItems.length ||
//             !_.isEqual(_.pluck(items, 'id'), _.pluck(newItems, 'id')) ||
//             !_.isEqual(_.pluck(items, 'depth'), _.pluck(newItems, 'depth'))
//         ) {
//             setItems(newItems);
//         }
//     };
//
//
// };

const MenuEditor = props => {
    console.log({ props });
    const namespace = op.get(props, 'namespace', 'menu-editor');
    const ElementDialog = useHookComponent('ElementDialog');
    const itemTypes = Reactium.MenuBuilder.ItemType.list || [];
    const cx = Reactium.Utils.cxFactory(namespace);

    const renderEditor = () => 'Editor';

    const renderControls = () => {
        return itemTypes.map(itemType => {
            const Control = op.get(itemType, 'control', () => null);
            return (
                <Control
                    key={itemType.id}
                    itemType={itemType}
                    cx={cx}
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
