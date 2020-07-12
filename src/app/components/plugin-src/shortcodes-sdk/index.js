import SDK from './sdk';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('shortcodes-sdk', 0).then(async () => {
    Reactium['Shortcode'] = op.get(Reactium, 'Shortcode') || SDK;

    // Prefetch shortcodes
    await SDK.list(true);
});
