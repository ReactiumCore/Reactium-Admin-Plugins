import { __ } from 'reactium-core/sdk';

const Solar = {
    id: 'solar',
    label: __('Solar'),
    tabs: [
        { id: 'navigation', tab: __('Navigation') },
        { id: 'color', tab: __('Colors') },
    ],
    navigation: [
        {
            id: 'header.main',
            label: __('Header Navigation:'),
        },
        {
            id: 'header.sub',
            label: __('Sub Navigation:'),
        },
        {
            id: 'footer.main',
            label: __('Footer Navigation:'),
        },
        {
            id: 'footer.social',
            label: __('Social Links:'),
        },
    ],
    colors: [
        {
            id: 'body.background',
            label: __('Body Background:'),
            defaultValue: '#000000',
        },
        {
            id: 'body.text',
            label: __('Body Text:'),
            defaultValue: '#FFFFFF',
        },
        {
            id: 'content.background',
            label: __('Content Background:'),
            defaultValue: '#FFFFFF',
        },
        {
            id: 'content.text',
            label: __('Content Text:'),
            defaultValue: '#333333',
        },
        {
            id: 'header.main.background',
            label: __('Header Background:'),
            defaultValue: '#0076be',
        },
        {
            id: 'header.main.text',
            label: __('Header Text:'),
            defaultValue: '#FFFFFF',
        },
        {
            id: 'header.main.accent',
            label: __('Header Accent:'),
            defaultValue: '#f7921e',
        },
        {
            id: 'header.sub.background',
            label: __('Sub Navigation Background:'),
            defaultValue: '#0086d8',
        },
        {
            id: 'header.sub.text',
            label: __('Sub Navigation Text:'),
            defaultValue: '#FFFFFF',
        },
        {
            id: 'header.sub.accent',
            label: __('Sub Navigation Accent:'),
            defaultValue: '#f7921e',
        },
        {
            id: 'footer.main.background',
            label: __('Footer Background:'),
            defaultValue: '#0076be',
        },
        {
            id: 'footer.main.text',
            label: __('Footer Text:'),
            defaultValue: '#FFFFFF',
        },
        {
            id: 'footer.main.border',
            label: __('Footer Border:'),
            defaultValue: '#383838',
        },
        {
            id: 'social.background',
            label: __('Social Background:'),
            defaultValue: '#262626',
        },
        {
            id: 'social.text',
            label: __('Social Text:'),
            defaultValue: '#FDFDFD',
        },
        {
            id: 'social.icon',
            label: __('Social Icon:'),
            defaultValue: '#000000',
        },
        {
            id: 'social.border',
            label: __('Social Border:'),
            defaultValue: '#000000',
        },
    ],
    swatches: [
        { id: 'lily', color: '#8d54a2' },
        { id: 'red', color: '#A82C40' },
        { id: 'tomato', color: '#ef373e' },
        { id: 'pink', color: '#D877A0' },
        { id: 'citrus', color: '#f26a36' },
        { id: 'sun', color: '#f7921e' },
        { id: 'daisy', color: '#ffe600' },
        { id: 'leaf', color: '#B2BB50' },
        { id: 'green', color: '#69b342' },
        { id: 'earth', color: '#0076be' },
        { id: 'blue', color: '#0086d8' },
        { id: 'purple', color: '#7A7CEF' },
        { id: 'gravel', color: '#9cbccd' },
        { id: 'slate', color: '#39607a' },
        { id: 'black', color: '#000000' },
        { id: 'smoke', color: '#262626' },
        { id: 'dark-gray', color: '#333333' },
        { id: 'shadow', color: '#383838' },
        { id: 'concrete', color: '#5e6367' },
        { id: 'gray', color: '#999999' },
        { id: 'grey', color: '#CCCCCC' },
        { id: 'light-grey', color: '#F7F7F7' },
        { id: 'off-white', color: '#FDFDFD' },
        { id: 'white', color: '#FFFFFF' },
    ],
};

export { Solar, Solar as default };
