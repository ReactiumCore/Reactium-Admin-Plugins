import op from 'object-path';
import React, { useState } from 'react';
import Reactium, {
    __,
    useAsyncEffect,
    useHookComponent,
} from 'reactium-core/sdk';

export default () => {
    const MenuItem = useHookComponent('MenuItem');

    const [canEdit, setCanEdit] = useState(false);

    const isActive = (match = {}) =>
        String(op.get(match, 'url', '/'))
            .replace(/\\/gi, '')
            .toLowerCase()
            .startsWith('/admin/components');

    const isVisible = () => {
        if (!Reactium.Plugin.isActive('Components')) return false;
        return canEdit;
    };

    useAsyncEffect(async () => {
        const validUser = await Reactium.Capability.check('components.write');
        setCanEdit(validUser);
    }, []);

    return isVisible() ? (
        <MenuItem
            label={__('Components')}
            route='/admin/components'
            icon='Linear.Cube'
            isActive={isActive}
        />
    ) : null;
};
