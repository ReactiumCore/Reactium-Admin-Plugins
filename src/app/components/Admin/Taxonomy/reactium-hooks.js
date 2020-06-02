/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin Taxonomy
 * -----------------------------------------------------------------------------
 */

import SDK from './sdk';
import _ from 'underscore';
import op from 'object-path';
import Component from './index';
import FieldType from './FieldType';
import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

Reactium.Taxonomy = op.get(Reactium, 'Taxonomy', SDK);

Reactium.Plugin.register('Taxonomy-plugin').then(() => {
    const fieldType = {
        label: __('Taxonomy'),
        icon: Icon.Feather.Tag,
        tooltip: __('Adds taxonomy to a content type.'),
        component: 'FieldTypeTaxonomy',
        showHelpText: false,
    };

    Reactium.Component.register(fieldType.component, FieldType);
    Reactium.ContentType.FieldType.register('Taxonomy', fieldType);
});
