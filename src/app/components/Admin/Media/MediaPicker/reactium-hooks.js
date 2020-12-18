import MediaPicker from './index';
import Reactium from 'reactium-core/sdk';

import Title from './Title';
import Remaining from './Remaining';
import TypeSelect from './TypeSelect';
import Pagination from './Pagination';
import SearchInput from './SearchInput';
import ImportMedia from './ImportMedia';
import SubmitButton from './SubmitButton';
import DismissButton from './DismissButton';
import DirectorySelect from './DirectorySelect';

const cx = Reactium.Utils.cxFactory('ar-media-picker');

Reactium.Plugin.register('MediaPicker').then(() => {
    Reactium.Component.register('MediaPicker', MediaPicker);

    Reactium.Zone.addComponent({
        id: cx('dismiss-button'),
        component: DismissButton,
        order: Reactium.Enums.priority.neutral,
        zone: cx('toolbar'),
    });

    Reactium.Zone.addComponent({
        id: cx('title'),
        component: Title,
        order: Reactium.Enums.priority.neutral + 2,
        zone: cx('toolbar'),
    });

    Reactium.Zone.addComponent({
        id: cx('remaining'),
        component: Remaining,
        order: Reactium.Enums.priority.neutral + 4,
        zone: cx('toolbar'),
    });

    Reactium.Zone.addComponent({
        id: cx('directory-select'),
        component: DirectorySelect,
        order: Reactium.Enums.priority.neutral + 6,
        zone: cx('toolbar'),
    });

    Reactium.Zone.addComponent({
        id: cx('type-select'),
        component: TypeSelect,
        order: Reactium.Enums.priority.neutral + 8,
        zone: cx('toolbar'),
    });

    Reactium.Zone.addComponent({
        id: cx('import'),
        zone: cx('toolbar'),
        component: ImportMedia,
        order: Reactium.Enums.priority.neutral + 10,
    });

    Reactium.Zone.addComponent({
        id: cx('search'),
        zone: cx('toolbar'),
        component: SearchInput,
        order: Reactium.Enums.priority.neutral + 12,
    });

    Reactium.Zone.addComponent({
        id: cx('pages'),
        zone: cx('footer'),
        component: Pagination,
        order: Reactium.Enums.priority.neutral + 2,
    });

    Reactium.Zone.addComponent({
        id: cx('submit'),
        zone: cx('footer'),
        component: SubmitButton,
        order: Reactium.Enums.priority.neutral + 4,
    });
});
