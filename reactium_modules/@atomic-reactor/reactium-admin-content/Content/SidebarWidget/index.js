import op from 'object-path';
import pluralize from 'pluralize';
import React, { useEffect, useState } from 'react';

import Reactium, { useHandle, useHookComponent } from 'reactium-core/sdk';

const useTypes = () => {
    const Sidebar = useHandle('AdminSidebar');

    const [types, setTypes] = useState([]);

    const getTypes = async () => {
        const _types = await Reactium.ContentType.types();
        setTypes(_types);
        Sidebar.render();
    };

    useEffect(() => {
        getTypes();
    }, []);

    return [types, setTypes];
};

export default () => {
    const [types] = useTypes();

    const MenuItem = useHookComponent('MenuItem');

    return types.map(item => (
        <MenuItem
            exact={false}
            key={`content-${item.uuid}`}
            label={pluralize(item.meta.label)}
            add={`/admin/content/${item.machineName}/new`}
            route={`/admin/content/${pluralize(item.type)}/page/1`}
            icon={op.get(item.meta, 'icon', 'Linear.Document2')}
        />
    ));
};
