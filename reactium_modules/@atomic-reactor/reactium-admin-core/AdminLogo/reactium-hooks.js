import Reactium, { useHookComponent } from '@atomic-reactor/reactium-core/sdk';

const Component = () => {
    const Logo = useHookComponent('Logo');
    return <Logo className='admin-logo' zone='admin-logo' href='/' />;
};

Reactium.Plugin.register('AdminLogo', Reactium.Enums.priority.lowest).then(
    () => {
        Reactium.Zone.addComponent({
            id: 'ADMIN-LOGO-PLUGIN',
            component: Component,
            zone: ['admin-header'],
            order: Reactium.Enums.priority.highest,
        });
    },
);
