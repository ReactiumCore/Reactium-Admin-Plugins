import React from 'react';
import Comparison from './MissingComparison';
import Reactium, { __ } from 'reactium-core/sdk';

const ID = 'Missing';

Reactium.Plugin.register(ID).then(() => {
    Reactium.Content.Comparison.register(ID, {
        component: Comparison,
    });
});
