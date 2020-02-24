import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import HeaderWidget from './HeaderWidget';

Reactium.Plugin.register('AdminContent', Reactium.Enums.priority.lowest).then(
    () => {
        Reactium.Zone.addComponent({
            id: 'ADMIN-CONTENT-CRUMBS',
            component: Breadcrumbs,
            order: 1,
            zone: ['admin-header'],
        });

        Reactium.Zone.addComponent({
            id: 'ADMIN-CONTENT-ADD',
            component: HeaderWidget,
            order: 2,
            zone: ['admin-logo'],
        });
    },
);
