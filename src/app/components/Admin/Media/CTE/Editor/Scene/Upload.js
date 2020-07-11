import _ from 'underscore';
import op from 'object-path';
import useLocalState from '../useLocalState';
import DirectoryPicker from '../DirectoryPicker';
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
} from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import Reactium, {
    __,
    useEventHandle,
    useHookComponent,
    useStore,
} from 'reactium-core/sdk';

export default forwardRef((props, ref) => {
    const store = useStore();

    const {
        active,
        browseFiles,
        cx,
        directories,
        isActive,
        back,
        nav,
    } = props.handle;

    const Uploads = useHookComponent('MediaUploads');
    const { Alert, Button, Icon } = useHookComponent('ReactiumUI');

    const defaultColor = Alert.ENUMS.COLOR.PRIMARY;
    const defaultIcon = useMemo(() => 'Feather.HelpCircle');
    const defaultMessage = useMemo(() =>
        __('Select directory and file to upload'),
    );

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, setState, getState] = useLocalState({
        color: defaultColor,
        directory: null,
        icon: defaultIcon,
        message: defaultMessage,
        uploads: op.get(store.getState(), 'Media.uploads'),
        pending: null,
        watch: {},
    });

    // -------------------------------------------------------------------------
    // Internal interface
    // -------------------------------------------------------------------------
    const add = (added = {}) => {
        const { watch = {} } = state;
        Object.entries(added).forEach(([key, value]) =>
            op.set(watch, key, value),
        );
        setState({ watch });
    };

    const hasUploads = () => Object.keys(getState('uploads')).length > 0;

    const onWorkerMessage = (...args) => {
        const worker = args[0];
        const { type, ...e } = worker;

        if (type !== 'status') return;

        const status = op.get(e.params, 'status');

        if (status === 'complete') {
            const ID = op.get(e.params, 'ID');
            const { directory, objectId, url } = e.params.result;

            const media = Reactium.Cache.get('editor.media');
            if (media) {
                let { data = {}, directories = [] } = media;

                directories.push(directory);
                directories = _.uniq(directories);
                directories.sort();

                op.set(data, objectId, e.params.result);
                op.set(data, 'directories', directories);
                op.set(media, 'data', data);

                Reactium.Cache.set('editor.media', media);
            }

            _.defer(() => select({ ID, objectId, url }));
        }
    };

    const reset = () => {
        if (isActive(props.id)) return;
        setState({ uploads: null, directory: null });
    };

    const select = async ({ ID, ...item }) => {
        const watch = getState('watch', {});
        props.handle.add(item);
        op.del(watch, ID);

        setState('watch', watch);

        if (Object.keys(watch).length < 1) {
            await nav('thumb', 'left');
            Reactium.Media.clear();
        }
    };

    const setDirectory = directory => setState('directory', directory);

    const setError = (message, pending = null, icon = 'Feather.AlertOctagon') =>
        setState({
            color: Alert.ENUMS.COLOR.DANGER,
            icon,
            message,
            pending,
        });

    // -------------------------------------------------------------------------
    // External interface
    // -------------------------------------------------------------------------
    const _handle = () => ({
        add,
        setDirectory,
        setError,
        value: { directory: getState('directory') },
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [state.directory]);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    // reset on inactive
    useEffect(reset, [active]);

    // update hande on directory change
    useEffect(() => {
        op.set(handle, 'value.directory', state.directory);
        setHandle(handle);
    }, [state.directory]);

    // upload pending files
    useEffect(() => {
        if (!getState('directory')) return;
        if (!getState('pending')) return;
        add(Reactium.Media.upload(state.pending, state.directory));
        setState('pending', null);
    }, [state.directory]);

    // uploads subscription
    useEffect(() => {
        return store.subscribe(() => {
            const uploads = op.get(store.getState(), 'Media.uploads');
            setState('uploads', uploads);
        });
    }, []);

    // Regsiter media-worker hook
    useEffect(() => {
        const mw = Reactium.Hook.register('media-worker', onWorkerMessage);
        return () => {
            Reactium.Hook.unregister(mw);
        };
    }, []);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return isActive(props.id) ? (
        <div className={cx('upload')}>
            <div className='p-xs-40 block'>
                <Message state={state} />
                <DirectoryPicker
                    defaultValue={state.directory}
                    directories={directories}
                    onChange={({ value }) => setState('directory', value)}
                />
            </div>
            <div className='content'>
                {hasUploads() && (
                    <div className='list'>
                        <Scrollbars>
                            <Uploads uploads={getState('uploads')} />
                            <div style={{ height: '50vh' }} />
                        </Scrollbars>
                    </div>
                )}
                <div className='dropbox'>
                    <div className={cx('label-dnd')}>{__('Drag and Drop')}</div>
                    <div className={cx('label-or')}>{__('or')}</div>
                    <div className={cx('btn-container')}>
                        <Button
                            appearance={Button.ENUMS.APPEARANCE.PILL}
                            color={Button.ENUMS.COLOR.PRIMARY}
                            onClick={browseFiles}
                            size={Button.ENUMS.SIZE.MD}>
                            {__('Upload A File')}
                        </Button>
                    </div>
                </div>
            </div>
            <span className='back-btn'>
                <Button color={Button.ENUMS.COLOR.CLEAR} onClick={back}>
                    <Icon name='Feather.X' />
                </Button>
            </span>
        </div>
    ) : null;
});

const Message = ({ state = {} }) => {
    const { Alert, Icon } = useHookComponent('ReactiumUI');

    return op.get(state, 'message') ? (
        <div className='block mb-xs-24'>
            <Alert icon={<Icon name={state.icon} />} color={state.color}>
                {state.message}
            </Alert>
        </div>
    ) : null;
};
