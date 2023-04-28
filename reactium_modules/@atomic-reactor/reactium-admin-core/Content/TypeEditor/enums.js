import React from 'react';
import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from 'reactium-ui';

const Enums = {
    DEFAULT_ICON: 'Linear.Papers',
    ZONE: (region = 1) => `types-fields-${region}`,
    TYPES: {},
    TEXT: {
        ADD: __('New Content Type'),
        EDIT: __('Edit'),
        TITLE: __('Content Types'),
    },
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
