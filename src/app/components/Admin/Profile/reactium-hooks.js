import Editor from './Editor';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';
import PasswordReset from './Editor/Password';

const components = [
    {
        id: 'ADMIN-PROFILE-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-header'],
        order: Reactium.Enums.priority.highest,
    },
    {
        id: 'ADMIN-PROFILE-EDITOR',
        component: Editor,
        zone: ['admin-sidebar'],
        order: Reactium.Enums.priority.lowest,
    },
    {
        id: 'ADMIN-PROFILE-RESET-INPUT',
        component: PasswordReset,
        zone: ['admin-profile-editor-form'],
        order: Reactium.Enums.priority.highest,
    },
];

Reactium.Plugin.register('AdminProfile').then(() => {
    // Add components
    components.forEach(component => Reactium.Plugin.addComponent(component));
});
