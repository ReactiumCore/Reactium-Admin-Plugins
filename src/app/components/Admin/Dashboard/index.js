import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import domain from './domain';

import Reactium, {
    __,
    Zone,
    useHookComponent,
    useReduxState,
} from 'reactium-core/sdk';

import React, { useEffect, useRef, useState } from 'react';

const ENUMS = {
    TEXT: {
        TITLE: __('Dashboard'),
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Dashboard
 * -----------------------------------------------------------------------------
 */
let Dashboard = props => {
    const { title, namespace } = props;
    const Helmet = useHookComponent('Helmet');
    const cx = Reactium.Utils.cxFactory(namespace);
    const [data, setData] = useReduxState(domain.name);

    return (
        <div className={cx()}>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            {Reactium.Dashboard.list.map(({ id, component: Component }) => (
                <Component
                    key={id}
                    id={id}
                    cx={cx}
                    data={data}
                    setData={setData}
                />
            ))}
            <Zone
                zone={`${namespace}-widgets`}
                cx={cx}
                data={data}
                setData={setData}
            />
        </div>
    );
};

Dashboard.defaultProps = {
    namespace: 'admin-dashboard',
    title: __('Dashboard'),
};

export { Dashboard as default };
