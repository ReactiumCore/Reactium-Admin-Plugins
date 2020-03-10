import Reactium from 'reactium-core/sdk';
import ActivityLogDashboardWidget from './index';

const dashId = 'DASHBOARD_ACTIVITY_LOG';

const plugin = async () => {
    await Reactium.Plugin.register(dashId);

    Reactium.Dashboard.register(dashId, {
        component: ActivityLogDashboardWidget,
    });

    Reactium.Hook.register(
        'dashboard-data-load',
        async (getStateById, setState) => {
            try {
                const { results = [] } = await Reactium.Content.changelog();
                setState(dashId, results);
            } catch (error) {
                console.log('Error loading dashboard activity log', error);
            }
        },
    );
};
plugin();
