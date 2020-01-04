import { Icon } from '@atomic-reactor/reactium-ui';

const Enums = {
    TYPES: {
        TEXT: 'text',
        LIST: 'list',
        CODE: 'code',
        IMAGE: 'image',
        COLOR: 'color',
    },
    MODE: {
        NEW: Symbol('NEW'),
        EDIT: Symbol('EDIT'),
    },
    ICONS: {
        TEXT: Icon.Feather.Type,
        LIST: Icon.Linear.List,
        CODE: Icon.Linear.Code,
        IMAGE: Icon.Linear.FileImage,
        COLOR: Icon.Linear.Palette,
    },
};

export default Enums;
