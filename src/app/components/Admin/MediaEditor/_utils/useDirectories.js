import op from 'object-path';
import Reactium from 'reactium-core/sdk';
import ENUMS from 'components/Admin/Media/enums';
import React, { useEffect, useState } from 'react';

export default (params = {}) => {
    const [state, setNewState] = useState({
        data: undefined,
        status: ENUMS.STATUS.INIT,
    });

    const setState = newState =>
        setNewState({
            ...state,
            ...newState,
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
