import Reactium from 'reactium-core/sdk';
import actions from './actions';
import domain from './domain';
import op from 'object-path';
import _ from 'underscore';
import ENUMS from './enums';

const subscriptions = {};
const registerPlugin = async () => {
    await Reactium.Plugin.register(
        domain.name,
        Reactium.Enums.priority.highest,
    );

    await Reactium.Hook.run('activity-log-enums', ENUMS);

    Reactium.Hook.register(
        'form-editor-status',
        async (statusEvt, type, handle) => {
            const store = Reactium.Plugin.redux.store;
            const event = op.get(statusEvt, 'event');
            const contentId = op.get(statusEvt, 'value.objectId');

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
