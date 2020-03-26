import op from 'object-path';
import ENUMS from 'components/Admin/Media/enums';
import React, { useEffect, useState } from 'react';
import Reactium, { useDerivedState } from 'reactium-core/sdk';

const useDirectories = (params = {}) => {
    const [state, setState] = useDerivedState({
        data: undefined,
        status: ENUMS.STATUS.INIT,
    });

    useEffect(() => {
        const { status } = state;
        if (status === ENUMS.STATUS.INIT && !op.get(state, 'data')) {
            setState({ status: ENUMS.STATUS.FETCHING });
            Reactium.Cloud.run('directories', params).then(results =>
                setState({ status: ENUMS.STATUS.READY, data: results }),
            );
        }
    });

    return state.data;
};

export { useDirectories, useDirectories as default };
