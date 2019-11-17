import SearchBar from './index';
import Reactium from 'reactium-core/sdk';

const components = [
    {
        id: 'ADMIN-SEARCH-WIDGET',
        component: SearchBar,
        zone: ['admin-header'],
        order: Reactium.Enums.priority.highest,
    },
];

Reactium.Plugin.register('AdminSearchBar').then(() => {
    // Add components
    components.forEach(component => Reactium.Plugin.addComponent(component));
});
