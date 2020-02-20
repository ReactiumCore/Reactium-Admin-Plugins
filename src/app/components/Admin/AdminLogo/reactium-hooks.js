import Reactium, { useHookComponent } from 'reactium-core/sdk';

const Component = () => {
    const Logo = useHookComponent('Logo');
    return <Logo className='admin-logo' href='/' />;
};

Reactium.Plugin.register('AdminLogo').then(() => {
    Reactium.Zone.addComponent({
        id: 'ADMIN-LOGO-PLUGIN',
        component: Component,
        zone: ['admin-header'],
        order: Reactium.Enums.priority.highest * 10,
    });
});
