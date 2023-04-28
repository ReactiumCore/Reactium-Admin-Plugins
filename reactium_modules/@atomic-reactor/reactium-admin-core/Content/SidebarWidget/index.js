import React from 'react';
import op from 'object-path';
import pluralize from 'pluralize';
import { __, useHookComponent } from 'reactium-core/sdk';

export default () => {
    const MenuItem = useHookComponent('MenuItem');
    const [types] = useHookComponent('useContentTypes')();

    const isActive = (match = {}) =>
        String(op.get(match, 'url', '/'))
            .replace(/\\/gi, '')
            .toLowerCase()
            .startsWith('/admin/type');

    return (
        <>
            {types.map(item => (
                <MenuItem
                    exact={false}
                    key={`content-${item.uuid}`}
                    label={pluralize(item.meta.label)}
                    add={`/admin/content/${item.machineName}/new`}
                    route={`/admin/content/${pluralize(item.type)}/page/1`}
                    icon={op.get(item.meta, 'icon', 'Linear.Document2')}
                />
            ))}
            <MenuItem
                isActive={isActive}
                route='/admin/types'
                add='/admin/type/new'
                icon='Linear.Typewriter'
                label={__('Content Types')}>
                {types.map(({ uuid, meta }) => (
                    <MenuItem
                        key={uuid}
                        label={`${meta.label}`}
                        route={`/admin/type/${uuid}`}
                    />
                ))}
            </MenuItem>
        </>
    );
};
