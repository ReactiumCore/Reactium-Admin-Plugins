import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { __, useHandle } from 'reactium-core/sdk';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

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
let Dashboard = ({ children, ...props }, ref) => {
    // Refs
    const containerRef = useRef();
    const stateRef = useRef({
        ...props,
    });

    // State
    const [, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const cx = () => {
        const { className, namespace } = stateRef.current;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    // Renderer
    const render = () => {
        const { title } = stateRef.current;

        return (
            <>
                <Helmet>
                    <meta charSet='utf-8' />
                    <title>{title}</title>
                </Helmet>
                <div ref={containerRef} className={cx()}>
                    {title}

                    <div
                        title='tooltip'
                        data-tooltip
                        data-align='left'
                        data-vertical-align='top'
                        style={{
                            marginTop: 1000,
                            marginLeft: 20,
                            marginBottom: 200,
                        }}>
                        Tooltip
                    </div>
                </div>
            </>
        );
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        container: containerRef.current,
        ref,
        setState,
        state: stateRef.current,
    }));

    // Render
    return render();
};

Dashboard = forwardRef(Dashboard);

Dashboard.ENUMS = ENUMS;

Dashboard.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    title: PropTypes.string,
};

Dashboard.defaultProps = {
    namespace: 'admin-dashboard',
    title: ENUMS.TEXT.TITLE,
};

export { Dashboard as default };
