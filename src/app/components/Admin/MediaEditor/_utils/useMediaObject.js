import op from 'object-path';
import ENUMS from 'components/Admin/Media/enums';
import React, { useEffect, useState } from 'react';
import Reactium, { useSelect } from 'reactium-core/sdk';

export default ID => {
    ID = ID || useSelect(state => op.get(state, 'Router.params.id'));

    const [state, setNewState] = useState({
        data: undefined,
        status: ENUMS.STATUS.INIT,
        updated: Date.now(),
    });

    const setState = newState =>
        setNewState({
            ...state,
            ...newState,
        });

    useEffect(() => {
        const { status } = state;

        if (status === ENUMS.STATUS.FETCHING) return;

        if (ID && status === ENUMS.STATUS.INIT && !op.get(state, 'data')) {
            setState({ status: ENUMS.STATUS.FETCHING });

            // Get the object from already fetched data
            const data = Reactium.Media.file(ID);

            if (data) {
                setState({ data, status: ENUMS.STATUS.READY });
            } else {
                Reactium.Media.retrieve(ID).then(result =>
                    setState({
                        status: ENUMS.STATUS.READY,
                        data: result,
                        updated: Date.now(),
                    }),
                );
            }
        }
    }, [ID, op.get(state, 'data'), op.get(state, 'status')]);

    return [state.data, ID, state.updated];
};
