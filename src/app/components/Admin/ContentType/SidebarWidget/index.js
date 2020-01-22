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

    const getTypes = async () => {
        const types = await Reactium.ContentType.types();
        typesRef.current = types;
        update(uuid());
    };

    useRegisterHandle(
        'ContentType/SidebarWidget',
        () => ({
            getTypes,
        }),
        [],
    );

    useEffect(() => {
        getTypes();
    }, []);

    return (
        <MenuItem label={__('Content Types')} icon='Linear.Typewriter'>
            <Zone zone={'admin-sidebar-types'} />
            <MenuItem
                label={__('New')}
                icon='Linear.PlusSquare'
                route='/admin/type/new'
            />
            {typesRef.current.map(({ uuid, type }) => (
                <MenuItem
                    key={uuid}
                    label={type}
                    route={`/admin/type/${uuid}`}
                />
            ))}
        </MenuItem>
    );
};
