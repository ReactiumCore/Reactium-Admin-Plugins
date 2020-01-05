import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import slugify from 'slugify';
import React, { useEffect } from 'react';
import ENUMS from 'components/Admin/Media/enums';
import useMediaObject from './_utils/useMediaObject';
import useDirectories from './_utils/useDirectories';

import Reactium, {
    useDerivedState,
    useHandle,
    useHookComponent,
    useRegisterHandle,
} from 'reactium-core/sdk';

const MediaEditor = props => {
    const AudioEditor = useHookComponent('AudioEditor');
    const Blocker = useHookComponent('Blocker');
    const FileEditor = useHookComponent('FileEditor');
    const ImageEditor = useHookComponent('ImageEditor');
    const VideoEditor = useHookComponent('VideoEditor');

    const tools = useHandle('AdminTools');

    const Toast = op.get(tools, 'Toast');

    const [data, ID] = useMediaObject();

    const directories = useDirectories();

    const [state, setState] = useDerivedState({
        ...props,
        files: {},
        initialData: data,
        status: !ID || !data ? ENUMS.STATUS.FETCHING : ENUMS.STATUS.READY,
        value: null,
    });

    const cname = () => {
        const { className, namespace } = state;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    const cx = cls => _.compact([op.get(state, 'namespace'), cls]).join('-');

    const onChange = async e => {
        const { value = {} } = state;

        await Reactium.Hook.run('admin-media-change', {
            data,
            e,
            type: 'IMAGE',
            value,
        });

        setState({ value });
    };

    const onError = async error => {
        await Reactium.Hook.run('admin-media-update-error', error);

        const { message } = error;

        if (message) {
            Toast.show({
                icon: 'Feather.AlertOctagon',
                message,
                type: Toast.TYPE.ERROR,
            });
        }

        setState({ error, status: ENUMS.STATUS.ERROR, update: Date.now() });
    };

    const onSubmit = async e => {
        const { file, status, value } = state;

        if (status === ENUMS.STATUS.PROCESSING) return;

        // Clean up value object:
        [
            'capabilities',
            'createdAt',
            'fetched',
            'file',
            'thumbnail',
            'type',
            'uuid',
            'updateAt',
            'user',
        ].forEach(param => op.del(value, param));

        setState({
            error: {},
            progress: 0,
            status: ENUMS.STATUS.PROCESSING,
            update: Date.now(),
        });

        value.filename = String(slugify(value.filename)).toLowerCase();

        await Reactium.Hook.run('admin-media-update', {
            data,
            file,
            status,
            type: 'IMAGE',
            value,
        });

        Reactium.Media.update({ file, ...value });
    };

    const onWorkerMessage = e => {
        const { type, params } = e;

        switch (type) {
            case 'error':
                onError(params);
                break;

            case 'status':
                setState({ ...params, update: Date.now() });
                break;
        }
    };

    // External Interface
    const handle = () => ({
        ID,
        cname,
        cx,
        data,
        directories,
        onChange,
        onError,
        onSubmit,
        setState,
        state,
    });

    useRegisterHandle('MediaEditor', handle, [
        ID,
        data,
        directories,
        onChange,
        onError,
        onSubmit,
        state,
        op.get(state, 'initialData'),
        op.get(state, 'status'),
        op.get(state, 'updated'),
    ]);

    // Side effects
    useEffect(() => {
        if (ID && data && state.status === ENUMS.STATUS.FETCHING) {
            setState({
                status: ENUMS.STATUS.READY,
                value: { ...data, fetched: Date.now() },
                update: Date.now(),
            });
        }
    }, [ID, data, state.status]);

    // Regsiter media-worker hook
    useEffect(() => {
        const workerHook = Reactium.Hook.register(
            'media-worker',
            onWorkerMessage,
        );
        return () => {
            Reactium.Hook.unregister(workerHook);
        };
    });

    // Worker status update
    useEffect(() => {
        const { result, status } = state;

        switch (status) {
            case ENUMS.STATUS.COMPLETE:
                Toast.show({
                    icon: 'Feather.Check',
                    type: Toast.TYPE.INFO,
                    message: ENUMS.TEXT.EDITOR.SUCCESS,
                });

                setState({
                    status: ENUMS.STATUS.READY,
                    initialData: result,
                    result: undefined,
                    file: undefined,
                    update: Date.now(),
                });
                break;
        }
    }, [state.status]);

    // Value changes
    useEffect(() => {
        const { file, status, value } = state;
        if (status === ENUMS.STATUS.READY) {
            Reactium.Hook.run('admin-media-value-change', {
                file,
                value,
            });
        }
    }, [state, state.value, state.file, state.status]);

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

MediaEditor.defaultProps = {
    namespace: 'admin-media-editor',
};

export { MediaEditor as default };
