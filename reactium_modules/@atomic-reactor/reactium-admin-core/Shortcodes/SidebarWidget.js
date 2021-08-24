import React, { useState } from 'react';
import op from 'object-path';
import Reactium, {
    __,
    useAsyncEffect,
    useHookComponent,
} from 'reactium-core/sdk';

const isActive = (match = {}) =>
    String(op.get(match, 'url', '/'))
        .replace(/\\/gi, '')
        .toLowerCase()
        .startsWith('/admin/shortcodes');

export default () => {
    const MenuItem = useHookComponent('MenuItem');

    const [canEdit, setCanEdit] = useState(false);

    const isVisible = () => {
        if (!Reactium.Plugin.isActive('Shortcodes')) return false;
        return canEdit;
    };

    useAsyncEffect(async () => {
        const validUser = await Reactium.Capability.check('shortcodes.create');
        setCanEdit(validUser);
    }, []);

    return isVisible() ? (
        <MenuItem
            label={__('Shortcodes')}
            route='/admin/shortcodes'
            icon='Linear.Puzzle'
            isActive={isActive}
        />
    ) : null;
};
