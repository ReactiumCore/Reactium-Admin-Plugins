import React from 'react';
import { __ } from 'reactium-core/sdk';
import MenuItem from 'components/Admin/MenuItem';

export default () => (
    <MenuItem label={__('Media')} route='/admin/media' icon='Linear.Pictures' />
);
