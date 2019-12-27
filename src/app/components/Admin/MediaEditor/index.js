import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import ENUMS from './_utils/enums';
import useMediaObject from './_utils/useMediaObject';

import Reactium, {
    useDerivedState,
    useHookComponent,
    useRegisterHandle,
    useSelect,
} from 'reactium-core/sdk';

import React, { useEffect, useRef } from 'react';
import { Button, Dropzone, Spinner } from '@atomic-reactor/reactium-ui';

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

    const onFileAdded = e => {
        console.log(e);
    };

    const onFileError = e => {
        console.log(e);
    };

    // External Interface
    const handle = () => ({
        ID,
        data,
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
            <>
                {state.status === ENUMS.STATUS.FETCHING && <Blocker />}
                {state.status === ENUMS.STATUS.READY && (
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
    dropzoneProps: {
        config: {
            chunking: false,
            clickable: false,
            previewTemplate:
                '<div class="dz-preview dz-file-preview"><span data-dz-name></div>',
        },
        debug: false,
    },
    namespace: 'admin-media-editor',
};

export { MediaEditor as default };
