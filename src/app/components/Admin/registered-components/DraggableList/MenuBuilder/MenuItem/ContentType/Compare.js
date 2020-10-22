import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';
import { Link } from 'react-router-dom';

const Compare = ({ item }) => {
    const { Icon } = useHookComponent('ReactiumUI');

    const label = op.get(item, 'label', '');
    const title = label.length
        ? label
        : op.get(item, 'item.title', op.get(item, 'item.slug'));
    const icon = op.get(
        item,
        'item.icon',
        op.get(item, 'item.type.meta.icon', 'Linear.Papers'),
    );

    const slug = op.get(item, 'item.slug');
    const typeSlug = op.get(item, 'item.type.machineName');
    const url = `/admin/content/${typeSlug}/${slug}`;

    return (
        <div>
            <Icon name={icon} />{' '}
            <Link to={`/admin/content/${typeSlug}/${slug}`} target='__blank'>
                <strong>{title}:</strong> {url}
            </Link>
        </div>
    );
};

export default Compare;
