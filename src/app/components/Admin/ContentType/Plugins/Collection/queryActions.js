//import React from 'react';

const queryActions = [
    {
        id: 'addAscending',
        label: '.%func(%key)',
        key: {
            placeholder: 'key',
            multiple: true,
        },
    },
    {
        id: 'addDescending',
        label: '.%func(%key)',
        key: {
            placeholder: 'key',
            multiple: true,
        },
    },
    {
        id: 'ascending',
        label: '.%func(%key)',
        key: {
            placeholder: 'key',
        },
    },
    {
        id: 'descending',
        label: '.%func(%key)',
        key: {
            placeholder: 'key',
        },
    },
    {
        id: 'containedBy',
        label: '.%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value1, value2, value3',
            type: 'array',
        },
    },
    {
        id: 'containedIn',
        label: '.%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value1, value2, value3',
            type: 'array',
        },
    },
];

export default queryActions;
