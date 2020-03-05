import Reactium from 'reactium-core/sdk';
import actions from './actions';
import domain from './domain';
import op from 'object-path';
import _ from 'underscore';

const subscriptions = {};
const registerPlugin = async () => {
    await Reactium.Plugin.register(domain.name);

    /**
     * @api {Function} Utils.splitParts(parts,key,value) Utils.splitParts()
     * @apiDescription Breaks formatted string (or array of strings), into flat
     * array of parts/nodes, inserting an object in array in the place of `%key%`.
     * Useful for tokenizing a translation string, and getting an array that can
     * easily be mapped into React components.
     * @apiParam {Mixed} parts String containing tokens or Array of strings
     * containing tokens mixed with Part objects in order.
     * @apiParam (Part) {String} key the key in the keypair
     * @apiParam (Part) {Mixed} value the value in the keypair
     * @apiName Utils.splitParts
     * @apiGroup Reactium.Utils
     */
    Reactium.Utils.splitParts = (parts, key, value) => {
        const search = `%${key}%`;
        if (typeof parts === 'string' && parts.includes(search)) {
            parts = parts.replace(search, '|FOUND_IT|');
            return _.compact(
                parts.split('|').map(part => {
                    if (part === 'FOUND_IT')
                        return {
                            key,
                            value,
                        };

                    if (part === '') return;

                    return part;
                }),
            );
        } else if (Array.isArray(parts)) {
            return _.flatten(
                parts.map(part => Reactium.Utils.splitParts(part, key, value)),
            );
        } else {
            return parts;
        }
    };

    Reactium.Hook.register(
        'form-editor-status',
        async (statusEvt, type, handle) => {
            const store = Reactium.Plugin.redux.store;
            const event = op.get(statusEvt, 'event');
            const contentId = op.get(statusEvt, 'content.objectId');
            if (!event || !contentId) return;

            try {
                switch (event) {
                    case 'LOAD': {
                        const hookId = 'changelog-created';

                        // unsubscribe from any content other than this
                        Object.entries(subscriptions).forEach(
                            ([objectId, unsub]) => {
                                if (objectId !== contentId) unsub();
                            },
                        );

                        Reactium.Hook.unregister(hookId);

                        // load changelog
                        store.dispatch(actions.load(statusEvt, type, handle));

                        // subscriptions
                        subscriptions[
                            contentId
                        ] = await Reactium.Content.changelogSubscribe(
                            contentId,
                        );

                        Reactium.Hook.register(
                            hookId,
                            async logEntry => {
                                if (logEntry.contentId === contentId) {
                                    store.dispatch(
                                        actions.update(logEntry, handle),
                                    );
                                }
                            },
                            Reactium.Enums.priority.highest,
                            hookId,
                        );

                        break;
                    }
                }
            } catch (error) {
                console.log({ error });
            }
        },
    );
};

registerPlugin();
