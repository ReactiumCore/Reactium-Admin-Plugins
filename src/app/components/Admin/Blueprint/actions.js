import Reactium from 'reactium-core/sdk';
import deps from 'dependencies';

const actions = {};

// Returns loading thunk
actions.loadFactory = (route, config, blueprint) => (params, search) => async (
    dispatch,
    getState,
) => {
    /**
     * @api {Hook} blueprint-load blueprint-load
     * @apiDescription This hook is run whenever a route is loaded that matches the blueprint component.
     Implementing this hook will give you an opportunity to load data for your blueprint components. Also
     if you wish, you can set the data property on your hook's context to get that data spread into each of your
     blueprint children.
     * @apiName blueprint-load
     * @apiGroup Actinium-Admin.Hooks
     * @apiParam {Object} params includes:
     - params: object of route params
     - search: object of url search query
     - route: the route object
     - config: the route configuration (includes capabilities)
     - blueprint: the loading blueprint schema
     - dispatch: Redux dispatch function, in case you wish to dispatch after data loading
     - getState: Redux getState function, in case you need Redux state context in your data loading
     * @apiExample Example.js
     import Reactium from 'reactium-core/sdk';

     Reactium.Hook.register('blueprint-load', async (params, context) => {
         try {
             context.data = await Reactium.Cloud.run('my-data-loader');
         } catch(error) {
             context.data = { error };
         }
     });
     */
    return Reactium.Hook.run('blueprint-load', {
        params,
        search,
        route,
        config,
        blueprint,
        dispatch,
        getState,
    });
};

export default actions;
