import React from 'react';
import { __ } from 'reactium-core/sdk';
import MenuItem from 'reactium_modules/@atomic-reactor/reactium-admin-core/registered-components/MenuItem';

export default () => (
    <MenuItem label={__('Dashboard')} route='/admin' icon='Linear.Window' />
);
