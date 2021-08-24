import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';

const Compare = ({ item }) => {
    const { Icon } = useHookComponent('ReactiumUI');

    const title = op.get(item, 'item.title', '');
    const url = op.get(item, 'item.url', '');
    const icon = op.get(item, 'icon', 'Feather.Link');

    return (
        <div>
            <Icon name={icon} /> <strong>{title}:</strong> {url}
        </div>
    );
};

export default Compare;
