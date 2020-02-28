import Reactium from 'reactium-core/sdk';

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
    Reactium.Enums.priority.highest,
);
