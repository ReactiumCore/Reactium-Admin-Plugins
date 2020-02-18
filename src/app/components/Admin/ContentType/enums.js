import React from 'react';
import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

const Enums = {
    ZONE: (region = 1) => `types-fields-${region}`,
    TYPES: {},
    REQUIRED_REGIONS: {
        default: {
            id: 'default',
            label: __('Default'),
            slug: 'default',
            order: Reactium.Enums.priority.highest,
        },
        sidebar: {
            id: 'sidebar',
            label: __('Sidebar'),
            slug: 'sidebar',
            order: Reactium.Enums.priority.lowest,
        },
    },
};

export default Enums;
