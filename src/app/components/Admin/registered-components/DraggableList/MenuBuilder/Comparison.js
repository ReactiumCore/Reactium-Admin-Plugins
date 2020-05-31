import React from 'react';
import Reactium, { useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';

const DefaultItemCompare = ({ item }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    const type = op.get(item, 'type');
    const label = op.get(item, 'label', op.get(item, 'item.title'));
    return (
        <>
            <span>{type}</span>
            <span>{label}</span>
        </>
    );
};

const MenuCompare = props => {
    const field = op.get(props, 'field', {});
    const { items = [] } = op.get(props, 'value');
    const { fieldName: title } = field;
    const { Dialog } = useHookComponent('ReactiumUI');
    const itemTypes = _.indexBy(Reactium.MenuBuilder.ItemType.list, 'id');

    return (
        <Dialog header={{ title }} collapsible={false}>
            <div className='menu-compare p-xs-20' style={{ minHeight: '60px' }}>
                {items.map(item => {
                    const Compare = op.get(
                        itemTypes,
                        [item.type, 'Compare'],
                        DefaultItemCompare,
                    );
                    const depth = Number(op.get(item, 'depth', 0));
                    const indent = depth;
                    return (
                        <div key={item.id} className='menu-compare-row'>
                            <div
                                className='menu-compare-item'
                                style={{
                                    flex: `0 0 calc(100% - ${indent}rem)`,
                                }}>
                                <div className='menu-compare-details'>
                                    <Compare item={item} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Dialog>
    );
};

export default MenuCompare;
