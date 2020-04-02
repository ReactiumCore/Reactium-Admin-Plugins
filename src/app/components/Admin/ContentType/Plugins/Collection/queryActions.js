//import React from 'react';

const queryActions = [
    {
        id: 'addAscending',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
            multiple: true,
        },
    },
    {
        id: 'addDescending',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
            multiple: true,
        },
    },
    {
        id: 'ascending',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
        },
    },
    {
        id: 'descending',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
        },
    },
    {
        id: 'containedBy',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
        },
    },
    {
        id: 'containedIn',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
        },
    },
    {
        id: 'contains',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'substring',
        },
    },
    {
        id: 'containsAll',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
        },
    },
    {
        id: 'containsAllStartingWith',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
        },
    },
    {
        id: 'count',
        label: '%func(%options)',
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
    },
    {
        id: 'distict',
        label: '%func(%key, %options)',
        key: {
            placeholder: 'key',
        },
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
    },
    {
        id: 'doesNotExist',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
        },
    },
    {
        id: 'endsWith',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'suffix',
        },
    },
    {
        id: 'equalTo',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value',
        },
    },
    {
        id: 'exclude',
        label: '%func(%key)',
        key: {
            placeholder: 'keys...',
            multiple: true,
        },
    },
    {
        id: 'exists',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
        },
    },
    {
        id: 'find',
        label: '%func(%options)',
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
    },
    {
        id: 'first',
        label: '%func(%options)',
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
    },
    {
        id: 'fullText',
        label: '%func(%key, %value, %options)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value',
        },
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
    },
    {
        id: 'get',
        label: '%func(%key, %options)',
        key: {
            placeholder: 'objectId',
        },
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
            type: 'object',
        },
    },
    {
        id: 'greaterThan',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value',
        },
    },
    {
        id: 'greaterThanOrEqualTo',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value',
        },
    },
    {
        id: 'include',
        label: '%func(%key)',
        key: {
            placeholder: 'key',
        },
    },
    {
        id: 'includeAll',
        label: '%func()',
    },
    {
        id: 'lessThan',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value',
        },
    },
    {
        id: 'lessThanOrEqualTo',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value',
        },
    },
    {
        id: 'limit',
        label: '%func(%value)',
        value: {
            placeholder: 'number',
        },
    },
    {
        id: 'near',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'lat, lng',
            type: 'array',
        },
    },
    {
        id: 'notContainedIn',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
        },
    },
    {
        id: 'notEqualTo',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value',
        },
    },
    {
        id: 'polygonContains',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'lat, lng',
            type: 'array',
        },
    },
    {
        id: 'select',
        label: '%func(%key)',
        key: {
            placeholder: 'keys...',
            multiple: true,
        },
    },
    {
        id: 'skip',
        label: '%func(%key, %value, %options)',
        value: {
            placeholder: 'number',
        },
    },
    {
        id: 'sortByTextScore',
        label: '%func()',
    },
    {
        id: 'startsWith',
        label: '%func(%key, %value, %options)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'prefix',
        },
    },
    {
        id: 'equalTo',
        label: '%func(%key, %value, %options)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'value1, value2...',
            type: 'array',
        },
        options: {
            placeholder: 'useMasterKey: true, sessionToken: %token',
        },
    },
    {
        id: 'withinGeoBox',
        label: '%func(%key, %value, %options)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder:
                'southwestLat, southwestLng, northeastLat, northeastLng',
            type: 'array',
        },
    },
    {
        id: 'withinKilometers',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'lat, lng, maxDistance, sorted',
            type: 'array',
        },
    },
    {
        id: 'withinMiles',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'lat, lng, maxDistance, sorted',
            type: 'array',
        },
    },
    {
        id: 'withinRadians',
        label: '%func(%key, %value)',
        key: {
            placeholder: 'key',
        },
        value: {
            placeholder: 'lat, lng, maxDistance, sorted',
            type: 'array',
        },
    },
];

export default queryActions;

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
},
*/
