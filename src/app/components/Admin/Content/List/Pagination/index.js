import React from 'react';
import { Pagination } from '@atomic-reactor/reactium-ui';
import { useFulfilledObject, useHandle } from 'reactium-core/sdk';

export default ({ zoneID: zone, props, listID }) => {
    const List = useHandle(listID);
    const [ready] = useFulfilledObject(List, [
        'state.content',
        'state.pagination',
    ]);

    if (ready) console.log({ zone });

    return ready ? 'pagination' : null;
};
