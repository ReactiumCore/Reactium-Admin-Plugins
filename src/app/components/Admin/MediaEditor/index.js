import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import ENUMS from 'components/Admin/Media/enums';
import useMediaObject from './_utils/useMediaObject';
import useDirectories from './_utils/useDirectories';

import Reactium, {
    useDerivedState,
    useHookComponent,
    useRegisterHandle,
    useSelect,
} from 'reactium-core/sdk';

import React, { useEffect, useRef } from 'react';
import { Spinner } from '@atomic-reactor/reactium-ui';

console.log(ENUMS);
/**
 * -----------------------------------------------------------------------------
 * Hook Component: MediaEditor
 * -----------------------------------------------------------------------------
 */
const MediaEditor = props => {
    const AudioEditor = useHookComponent('AudioEditor');
    const Blocker = useHookComponent('Blocker');
    const FileEditor = useHookComponent('FileEditor');
    const ImageEditor = useHookComponent('ImageEditor');
    const VideoEditor = useHookComponent('VideoEditor');

    const [data, ID] = useMediaObject();

    const directories = useDirectories();

    const [state, setState] = useDerivedState({
        ...props,
        files: {},
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
        ID,
        cname,
        cx,
        data,
        directories,
        setState,
        state,
    });

    useRegisterHandle('MediaEditor', handle, [ID, data, state]);

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
            <>
                {state.status === ENUMS.STATUS.FETCHING && <Blocker />}
                {state.status !== ENUMS.STATUS.FETCHING && (
                    <>
                        {data.type === 'AUDIO' && <AudioEditor />}
                        {data.type === 'FILE' && <FileEditor />}
                        {data.type === 'IMAGE' && <ImageEditor />}
                        {data.type === 'VIDEO' && <VideoEditor />}
                    </>
                )}
            </>
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
