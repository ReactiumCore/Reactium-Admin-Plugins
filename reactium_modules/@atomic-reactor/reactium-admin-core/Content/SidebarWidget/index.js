import React from 'react';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';

export default () => {
    const MenuItem = useHookComponent('MenuItem');
    const [types] = useHookComponent('useContentTypes')();

    return (
        <>
            <MenuItem
                exact={false}
                route='/admin/types'
                add='/admin/type/new'
                icon='Linear.Typewriter'
                label={__('Content Types')}
            />
            {types.map(item => (
                <MenuItem
                    exact={false}
                    label={item.meta.label}
                    key={`content-${item.uuid}`}
                    route={`/admin/content/${item.type}/page/1`}
                    add={`/admin/content/${item.machineName}/new`}
                    icon={op.get(item.meta, 'icon', 'Linear.Document2')}
                />
            ))}
        </>
    );
};
