import React from 'react';
import { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

const Enums = {
    ZONE: 'types-fields',
    FIELD_MODES: {
        NEW: Symbol('NEW'),
        EDIT: Symbol('EDIT'),
    },
    TYPES: {
        TEXT: {
            type: 'Text',
            label: __('Text Field'),
            icon: Icon.Feather.Type,
            tooltip: __('Adds a text field to your content type.'),
            component: 'FieldTypeText',
        },
        NUMBER: {
            type: 'Number',
            label: __('Number Field'),
            icon: () => <small style={{ whiteSpace: 'nowrap' }}>1 2 3</small>,
            tooltip: __('Adds a number field to your content type.'),
            component: 'FieldTypeNumber',
        },
        LIST: {
            type: 'List',
            label: __('List Field'),
            icon: Icon.Linear.List,
            tooltip: __('Adds a list field to your content type.'),
            component: 'FieldTypeList',
        },
        CODE: {
            type: 'Code',
            label: __('Code Field'),
            icon: Icon.Linear.Code,
            tooltip: __('Adds a code field to your content type.'),
            component: 'FieldTypeCode',
        },
        IMAGE: {
            type: 'Image',
            label: __('Image Field'),
            icon: Icon.Linear.FileImage,
            tooltip: __('Adds an image field to your content type.'),
            component: 'FieldTypeImage',
        },
        COLOR: {
            type: 'Color',
            label: __('Color Field'),
            icon: Icon.Linear.Palette,
            tooltip: __('Adds a color field to your content type.'),
            component: 'FieldTypeColor',
        },
    },
};

export default Enums;
