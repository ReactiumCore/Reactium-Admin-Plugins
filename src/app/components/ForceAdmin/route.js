import Reactium from 'reactium-core/sdk';
import React, { useEffect } from 'react';
import op from 'object-path';

const setLoading = op.get(window, 'LoadingRef.current.setVisible', () => {});

export default {
    exact: true,
    path: '/',
    component: () => {
        useEffect(() => {
            setLoading(true);
            Reactium.Routing.history.push('/admin');
            setLoading(false);
        }, []);
        return null;
    },
};
