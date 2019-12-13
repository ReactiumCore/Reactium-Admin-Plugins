import React from 'react';
import { __ } from 'reactium-core/sdk';
import MenuItem from 'components/Admin/registered-components/MenuItem';

export default () => (
    <MenuItem label={__('Dashboard')} route='/admin' icon='Linear.Window' />
);
