//import React from 'react';

const queryActions = [
    {
        id: 'addAscending',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
            multiple: true,
            required: true,
        },
        order: 100,
    },
    {
        id: 'addDescending',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
            multiple: true,
            required: true,
        },
        order: 100,
    },
    {
        id: 'ascending',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
            required: true,
        },
        order: 100,
        max: 1,
    },
    {
        id: 'descending',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
            required: true,
        },
        order: 100,
        max: 1,
    },
    {
        id: 'containedBy',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
            required: true,
        },
        order: 100,
    },
    {
        id: 'containedIn',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
            required: true,
        },
        order: 100,
    },
    {
        id: 'contains',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'substring',
            required: true,
        },
        order: 100,
    },
    {
        id: 'containsAll',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
            required: true,
        },
        order: 100,
    },
    {
        id: 'containsAllStartingWith',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
            required: true,
        },
        order: 100,
    },
    {
        id: 'count',
        label: '%func(%options)',
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
        order: 5000,
        max: 1,
    },
    {
        id: 'distict',
        label: '%func(%key, %options)',
        key: {
            placeholder: 'key',
            required: true,
        },
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
        order: 100,
    },
    {
        id: 'doesNotExist',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
            required: true,
        },
        order: 100,
    },
    {
        id: 'endsWith',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'suffix',
            required: true,
        },
        order: 100,
    },
    {
        id: 'equalTo',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value',
            required: true,
        },
        order: 100,
    },
    {
        id: 'exclude',
        label: '%func(%key)',
        key: {
            placeholder: 'keys...',
            multiple: true,
            required: true,
        },
        order: 100,
    },
    {
        id: 'exists',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
            required: true,
        },
        order: 100,
    },
    {
        id: 'find',
        label: '%func(%options)',
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
        order: 1002,
        excludeWhen: ['first', 'get', 'count'],
        max: 1,
    },
    {
        id: 'first',
        label: '%func(%options)',
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
        order: 1001,
        excludeWhen: ['get', 'count'],
        max: 1,
    },
    {
        id: 'fullText',
        label: '%func(%key, %value, %options)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value',
            required: true,
        },
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
        order: 100,
    },
    {
        id: 'get',
        label: '%func(%key, %options)',
        key: {
            placeholder: 'objectId',
            required: true,
        },
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
        order: 1000,
        excludeWhen: ['count'],
        max: 1,
    },
    {
        id: 'greaterThan',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value',
            required: true,
        },
        order: 100,
    },
    {
        id: 'greaterThanOrEqualTo',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value',
            required: true,
        },
        order: 100,
    },
    {
        id: 'include',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
            required: true,
        },
        order: 100,
    },
    {
        id: 'includeAll',
        label: '%func()',
        order: 100,
    },
    {
        id: 'lessThan',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value',
            required: true,
        },
        order: 100,
    },
    {
        id: 'lessThanOrEqualTo',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value',
            required: true,
        },
        order: 100,
    },
    {
        id: 'limit',
        label: '%func(%value)',
        value: {
            placeholder: 'number',
            required: true,
            default: 1000,
        },
        order: 500,
        max: 1,
    },
    {
        id: 'near',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'lat, lng',
            type: 'array',
            required: true,
        },
        order: 100,
    },
    {
        id: 'notContainedIn',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
            required: true,
        },
        order: 100,
    },
    {
        id: 'notEqualTo',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value',
            required: true,
        },
        order: 100,
    },
    {
        id: 'polygonContains',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'lat, lng',
            type: 'array',
            required: true,
        },
        order: 100,
    },
    {
        id: 'select',
        label: '%func(%key)',
        key: {
            placeholder: 'keys...',
            multiple: true,
            required: true,
        },
        order: 100,
    },
    {
        id: 'skip',
        label: '%func(%value)',
        value: {
            placeholder: 'number',
            required: true,
            default: 0,
        },
        order: 500,
        max: 1,
    },
    {
        id: 'sortByTextScore',
        label: '%func()',
        order: 100,
    },
    {
        id: 'startsWith',
        label: '%func(%key, %value, %options)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'prefix',
            required: true,
        },
        order: 100,
    },
    {
        id: 'equalTo',
        label: '%func(%key, %value, %options)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
            required: true,
        },
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
        },
        order: 100,
    },
    {
        id: 'withinGeoBox',
        label: '%func(%key, %value, %options)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder:
                'southwestLat, southwestLng, northeastLat, northeastLng',
            type: 'array',
            required: true,
        },
        order: 100,
    },
    {
        id: 'withinKilometers',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'lat, lng, maxDistance, sorted',
            type: 'array',
            required: true,
        },
        order: 100,
    },
    {
        id: 'withinMiles',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'lat, lng, maxDistance, sorted',
            type: 'array',
            required: true,
        },
        order: 100,
    },
    {
        id: 'withinRadians',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
            required: true,
        },
        value: {
            placeholder: 'lat, lng, maxDistance, sorted',
            type: 'array',
            required: true,
        },
        order: 100,
    },
];

export { queryActions, queryActions as default };

/*
{
    id: 'equalTo',
    label: '%func(%key, %value, %options)',
    key: {
        placeholder: 'key'
    },
    value: {
        placeholder: 'value1, value2...',
    },
    options: {
        placeholder: 'useMasterKey: true, sessionToken: %token',
        type: 'object',
    },
    order: 100,
},
*/
