import Reactium from 'reactium-core/sdk';
import SidebarWidget from '.';

Reactium.Plugin.register('AdminProfile').then(() => {
    // Add components
    Reactium.Zone.addComponent({
        id: 'ADMIN-PROFILE-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-header'],
        order: Reactium.Enums.priority.lowest,
    });

    // Hooks
    Reactium.Hook.register(
        'profile-role-name',
        (role, user, context) => {
            switch (role) {
                case 'super-admin':
                    role = 'Super Admin';
                    break;

                case 'administrator':
                    role = 'Administrator';
                    break;
            }
            context['role'] = role;
        },
        Reactium.Enums.priority.lowest,
    );
});
