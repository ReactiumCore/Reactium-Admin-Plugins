import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import ENUMS from './_utils/enums';
import useMediaObject from './_utils/useMediaObject';

import Reactium, {
    useDerivedState,
    useRegisterHandle,
    useSelect,
} from 'reactium-core/sdk';

import React, { useEffect, useRef } from 'react';
import { Button, Spinner } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: MediaEditor
 * -----------------------------------------------------------------------------
 */
const MediaEditor = props => {
    const [data, ID] = useMediaObject();

    const [state, setState] = useDerivedState({
        ...props,
        status: !ID || !data ? ENUMS.STATUS.FETCHING : ENUMS.STATUS.READY,
        value: null,
    });

    // Refs

    const cname = () => {
        const { className, namespace } = state;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    const cx = cls => _.compact([op.get(state, 'namespace'), cls]).join('-');

    // External Interface
    const handle = () => ({
        setState,
        state,
    });

    useRegisterHandle('MediaEditor', handle, [
        ID,
        data,
        state.status,
        state.value,
    ]);

    // Side effects
    useEffect(() => {
        if (ID && data && state.status === ENUMS.STATUS.FETCHING) {
            setState({
                status: ENUMS.STATUS.READY,
                value: { ...data, fetched: Date.now() },
            });
        }
    }, [ID, data, state.status]);

    // Renderer
    const render = () => {
        return (
            <div className={cname()}>
                {state.status === ENUMS.STATUS.FETCHING ? (
                    <div className={cx('spinner')}>
                        <Spinner />
                    </div>
                ) : (
                    <div className='p-xs-40'>
                        {data.filename}
                        <br />
                        {state.value.fetched}
                        <br />
                        <Button
                            onClick={() => {
                                state.value.fetched = Date.now();
                                setState({ value: state.value });
                            }}>
                            Test
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    // Render
    return render();
};

MediaEditor.ENUMS = ENUMS;

MediaEditor.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

MediaEditor.defaultProps = {
    namespace: 'admin-media-editor',
};

export { MediaEditor as default };
