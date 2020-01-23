import React, { useEffect, useRef, useState } from 'react';
import Reactium, {
    __,
    useHookComponent,
    Zone,
    useRegisterHandle,
} from 'reactium-core/sdk';
import uuid from 'uuid/v4';

export default () => {
    const MenuItem = useHookComponent('MenuItem');
    const typesRef = useRef([]);
    const [, update] = useState(uuid());

    const getTypes = async (refresh = false) => {
        const types = await Reactium.ContentType.types(refresh);
        typesRef.current = types;
        update(uuid());
    };

    useEffect(() => {
        getTypes();
        return Reactium.Cache.subscribe('content-types', async ({ op }) => {
            if (op === 'del') getTypes(true);
        });
    }, []);

    return (
        <MenuItem label={__('Content Types')} icon='Linear.Typewriter'>
            <Zone zone={'admin-sidebar-types'} />
            <MenuItem
                label={__('New')}
                icon='Linear.PlusSquare'
                route='/admin/type/new'
            />
            {typesRef.current.map(({ uuid, type, label }) => (
                <MenuItem
                    key={uuid}
                    label={label ? label : type}
                    route={`/admin/type/${uuid}`}
                />
            ))}
        </MenuItem>
    );
};
