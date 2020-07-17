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

    /*
    Reactium.Capability.Settings.register('media-ui.view', {
        capability: 'media-ui.view',
        title: __('UI: Media'),
        tooltip: __('Able to view the media library when logged in.'),
        zone: 'app-settings',
    });

    Reactium.Capability.Settings.register('Media.retrieve', {
        capability: 'Media.retrieve',
        title: __('Media: Retrieve'),
        tooltip: __('Able to retrieve media when logged in.'),
        zone: 'app-settings',
    });

    Reactium.Capability.Settings.register('Media.create', {
        capability: 'Media.create',
        title: __('Media: Create'),
        tooltip: __('Able to create media when logged in.'),
        zone: 'app-settings',
    });

    Reactium.Capability.Settings.register('Media.update', {
        capability: 'Media.update',
        title: __('Media: Update'),
        tooltip: __('Able to update media when logged in.'),
        zone: 'app-settings',
    });

    Reactium.Capability.Settings.register('Media.delete', {
        capability: 'Media.delete',
        title: __('Media: Delete'),
        tooltip: __('Able to delete media when logged in.'),
        zone: 'app-settings',
    });
    */

    Reactium.Component.register('AdminChecklist', Checklist);
    Reactium.Component.register('AdminTagbox', Tagbox);
    Reactium.Component.register('TaxonomyEditor', TaxonomyEditor);
    Reactium.Component.register('TaxonomyTypeEditor', TaxonomyTypeEditor);
    Reactium.Component.register(fieldType.component, FieldType);
    Reactium.Content.Editor.register('Taxonomy', { component: ContentEditor });
    Reactium.ContentType.FieldType.register('Taxonomy', fieldType);
});
