Used to filter the content list results.

### Event Object

| Property  | Type   | Description                         |
| --------- | ------ | ----------------------------------- |
| field     | String | `Content` Object field to filter on |
| namespace | String | The admin zone namespace            |
| value     | Any    | The filter value to apply           |

### Usage

You can dispatch the `list-filter` event from your component:

```
// MyStatusComponent.js

import React from 'react';
import Reactium, { useDispatcher, useStateEffect } from 'reactium-core/sdk';

export const MyStatusComponent = () => {
    const dispatch = useDispatcher();

    const handler = e => value => {
        const field = 'status';
        const namespace = 'admin-content-list-filter';
        dispatch('list-filter', { field, namespace, value });
    };

    useStateEffect({
        'list-filter': console.log,
    });

    return Object.values(Reactium.Content.STATUS).map((status, i) => (
        <button key={`stat-${i}`} onClick={handler(status.value)}>
            {status.label}
        </button>
    ));
};

```
