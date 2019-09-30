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
            css: '/assets/style/style.css',
            selected: true,
        },
        {
            name: 'Theme 1',
            css: '/assets/style/theme-1.css',
        },
        {
            name: 'Theme 2',
            css: '/assets/style/theme-2.css',
        },
        {
            name: 'Protanopia Accessible',
            css: '/assets/style/protanopia.css',
        },
        {
            name: 'Deuteranopia Accessible',
            css: '/assets/style/deuteranopia.css',
        },
        {
            name: 'Deuteranomaly Accessible',
            css: '/assets/style/deuteranomaly.css',
        },
        {
            name: 'Tritanopia Accessible',
            css: '/assets/style/tritanopia.css',
        },
        {
            name: 'Tritanomaly Accessible',
            css: '/assets/style/tritanomaly.css',
        },
        {
            name: 'Achromatopsia Accessible',
            css: '/assets/style/achromatopsia.css',
        },
        {
            name: 'Achromatomaly Accessible',
            css: '/assets/style/achromatomaly.css',
        },
        {
            name: 'Chromatomaly Accessible',
            css: '/assets/style/achromatomaly.css',
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
    menu: {},
};
