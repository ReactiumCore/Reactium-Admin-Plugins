/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin Taxonomy
 * -----------------------------------------------------------------------------
 */

import SDK from './sdk';
import op from 'object-path';
import FieldType from './FieldType';
import Breadcrumbs from './Breadcrumbs';
import SidebarWidget from './SidebarWidget';
import TaxonomyEditor from './TaxonomyEditor';
import Taxonomy, { HeaderWidget } from './index';
import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import TaxonomyTypeEditor from './TaxonomyTypeEditor';
import { ContentEditor, Checklist, Tagbox } from './ContentEditor';

Reactium.Taxonomy = op.get(Reactium, 'Taxonomy', SDK);

Reactium.Plugin.register('Taxonomy-plugin').then(() => {
    const fieldType = {
        label: __('Taxonomy'),
        icon: Icon.Feather.Tag,
        tooltip: __('Adds taxonomy to a content type.'),
        component: 'FieldTypeTaxonomy',
        showHelpText: false,
    };

    Reactium.Zone.addComponent({
        id: 'TAXONOMY',
        zone: ['admin-taxonomy-content'],
        component: Taxonomy,
        order: 0,
    });

    Reactium.Zone.addComponent({
        id: 'TAXONOMY-BREADCRUMBS',
        zone: ['admin-header'],
        component: Breadcrumbs,
        order: 0,
    });

    Reactium.Zone.addComponent({
        id: 'TAXONOMY-SIDEBAR-WIDGET',
        zone: ['admin-sidebar-menu'],
        component: SidebarWidget,
        order: 401,
    });

    Reactium.Zone.addComponent({
        id: 'TAXONOMY-NEW',
        zone: ['admin-logo'],
        component: HeaderWidget,
        order: 100,
    });

    Reactium.Component.register('AdminChecklist', Checklist);
    Reactium.Component.register('AdminTagbox', Tagbox);
    Reactium.Component.register('TaxonomyEditor', TaxonomyEditor);
    Reactium.Component.register('TaxonomyTypeEditor', TaxonomyTypeEditor);
    Reactium.Component.register(fieldType.component, FieldType);
    Reactium.Content.Editor.register('Taxonomy', { component: ContentEditor });
    Reactium.ContentType.FieldType.register('Taxonomy', fieldType);
});
