import axios from 'axios';
import Parse from 'parse/node';

const Worker = {
    worker: null,

    initialize: async ({ parseAppId, restAPI, sessionToken }) => {
        Parse.initialize(parseAppId);
        Parse.serverURL = restAPI;

        try {
            const file = await new Parse.Query('Media')
                .equalTo('objectId', 'WAJA7nQxhF')
                .skip(0)
                .limit(100)
                .first({ sessionToken });

            return Promise.resolve(file.get('url'));
        } catch (err) {
            console.log(err, restAPI);
            return Promise.resolve(err.message);
        }
    },

    onMessage: async e => {
        const { action, params } = e.data;
        switch (action) {
            default:
                const message = await this[action](params);

                self.postMessage({ action, message });
        }
    },
};

self.addEventListener('message', e => Worker.onMessage(e));
