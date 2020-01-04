import { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

const Enums = {
    TYPES: {
        TEXT: {
            label: __('Text Field'),
            icon: Icon.Feather.Type,
            tooltip: __('Adds a text field to your content type.'),
            component: 'FieldTypeText',
        },
        LIST: {
            label: __('List Field'),
            icon: Icon.Linear.List,
            tooltip: __('Adds a list field to your content type.'),
            component: 'FieldTypeList',
        },
        CODE: {
            label: __('Code Field'),
            icon: Icon.Linear.Code,
            tooltip: __('Adds a code field to your content type.'),
            component: 'FieldTypeCode',
        },
        IMAGE: {
            label: __('Image Field'),
            icon: Icon.Linear.FileImage,
            tooltip: __('Adds an image field to your content type.'),
            component: 'FieldTypeImage',
        },
        COLOR: {
            label: __('Color Field'),
            icon: Icon.Linear.Palette,
            tooltip: __('Adds a color field to your content type.'),
            component: 'FieldTypeColor',
        },
    },
};

export default Enums;
