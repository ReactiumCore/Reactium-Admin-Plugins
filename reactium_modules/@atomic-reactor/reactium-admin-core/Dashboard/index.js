import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import domain from './domain';

import Reactium, {
    __,
    Zone,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

// import { useReduxState } from '@atomic-reactor/use-select';

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
let Dashboard = (props) => {
    const { title, namespace } = props;
    const Helmet = useHookComponent('Helmet');
    const cx = Reactium.Utils.cxFactory(namespace);

    // TODO: Update using Reactium.State
    // const [data, setData] = useReduxState(domain.name);
    const data = {},
        setData = () => {};

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
