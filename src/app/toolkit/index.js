module.exports = {
    header: {
        name: 'Reactium',
        title: 'Style Guide',
        logo: '/assets/images/atomic-reactor-logo.svg',
        version: '2.1.2',
    },
    overview: require('appdir/toolkit/overview').default,
    themes: [
        {
            name: 'Default',
            css: '/assets/style/admin.css',
            selected: true,
        },
    ],
    assets: {
        path: '/assets',
    },
    sidebar: {
        closed: false,
        position: 'left',
    },
    toolbar: {
        buttons: [
            {
                icon: 'Dna',
                name: 'filter-all',
                label: 'All Elements',
            },
            {
                icon: 'Atom',
                name: 'filter-atom',
                label: 'Atoms',
            },
            {
                icon: 'Molecule',
                name: 'filter-molecule',
                label: 'Molecules',
            },
            {
                icon: 'Organism',
                name: 'filter-organism',
                label: 'Organisms',
            },
            {
                icon: 'Catalyst',
                name: 'filter-catalyst',
                label: 'Catalyst',
            },
            {
                icon: 'Page',
                name: 'filter-page',
                label: 'Pages',
            },
            {
                icon: 'Template',
                name: 'filter-template',
                label: 'Templates',
            },
            {
                name: 'spacer',
            },
            {
                icon: 'Settings',
                name: 'toggle-settings',
                cls: 'toggle',
            },
        ],
    },
    menu: {
        components: {
            label: 'Components',
            route: '/toolkit/components',
            hideEmpty: true,
            elements: {},
        },
        'content-type': {
            label: 'Content Type',
            route: '/toolkit/content-type',
            elements: {
                'field-type-organism': {
                    type: 'organism',
                    label: 'Field Type Dialog',
                    route: '/toolkit/content-type/field-type-organism',
                    dna: '/toolkit/content-type/FieldTypeOrganism',
                    component: require('appdir/toolkit/content-type/FieldTypeOrganism')
                        .default,
                    hideCode: true,
                    hideDna: true,
                    hideDocs: true,
                },
            },
        },
    },
};
