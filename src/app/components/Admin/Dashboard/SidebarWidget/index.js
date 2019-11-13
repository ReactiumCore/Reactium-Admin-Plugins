import React from 'react';
import { __ } from 'reactium-core/sdk';
import MenuItem from 'components/Admin/MenuItem';

export default () => (
    <MenuItem label={__('Dashboard')} route='/admin' icon='Linear.Window' />
);
