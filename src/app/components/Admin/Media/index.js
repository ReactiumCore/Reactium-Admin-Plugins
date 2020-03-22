import _ from 'underscore';
import cn from 'classnames';
import Empty from './Empty';
import ENUMS from './enums';
import op from 'object-path';
import domain from './domain';
import Toolbar from './Toolbar';
import List from './List';
import Directory from './Directory';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';
import { Dropzone, Spinner } from '@atomic-reactor/reactium-ui';

import Reactium, {
    useHandle,
    useHookComponent,
    useReduxState,
    useRegisterHandle,
    useSelect,
    useStore,
    useWindowSize,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

// Server-Side Render safe useLayoutEffect (useEffect when node)
const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Media
 * -----------------------------------------------------------------------------
 */
let Media = ({ dropzoneProps, namespace, zone, title }, ref) => {
    const Helmet = useHookComponent('Helmet');

    const Uploads = useHookComponent('MediaUploads');

    const [state, setState] = useReduxState(domain.name);

    const [status, setStatus] = useState(ENUMS.STATUS.INIT);

    const SearchBar = useHandle('SearchBar');

    const page = Number(
        useSelect(state => op.get(state, 'Router.params.page', 1)),
    );

    // Refs
    const animationRef = useRef({});
    const directoryRef = useRef(op.get(state, 'directory'));
    const dropzoneRef = useRef();
    const stateRef = useRef(state);

    // Functions
    const cx = cls => _.compact([namespace, cls]).join('-');

    const isEmpty = () => op.get(state, 'pagination.empty', true);

    const isUploading = () =>
        Object.keys(op.get(state, 'files', {})).length > 0;

    const onBrowseClick = () => dropzoneRef.current.browseFiles();

    const onError = evt => {
        console.log({ error: evt.message });

        setState({
            error: { message: evt.message },
        });
    };

    const onFileAdded = e => {
        const directory = directoryRef.current || 'uploads';
        return Reactium.Media.upload(e.added, directory);
    };

    const onFileRemoved = file => {
        if (dropzoneRef.current) {
            dropzoneRef.current.removeFiles(file);
        }
    };

    const onFolderSelect = dir => {
        directoryRef.current = dir;
        setState({ directory: dir });
    };

    // Side effects
    useEffect(() => SearchBar.setState({ visible: !isEmpty() }));

    // fetch
    useEffect(() => {
        if (status !== ENUMS.STATUS.INIT || status === ENUMS.STATUS.READY)
            return;

        setStatus(ENUMS.STATUS.PENDING);

        Reactium.Media.fetch({ page: 1 }).then(() => {
            setStatus(ENUMS.STATUS.READY);
        });
    }, [status]);

    // External Interface
    const handle = () => ({
        ENUMS,
        browseFiles: onBrowseClick,
        cname: cx,
        directory: directoryRef.current,
        folderSelect: onFolderSelect,
        isEmpty,
        setState,
        state,
        zone,
    });

    useRegisterHandle(domain.name, handle, [
        op.get(state, 'updated'),
        isEmpty(),
    ]);

    // Render
    const render = () => {
        return (
            <>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                {op.get(state, 'fetched') ? (
                    <Dropzone
                        {...dropzoneProps}
                        className={cx('dropzone')}
                        files={{}}
                        onError={onError}
                        onFileAdded={e => onFileAdded(e)}
                        ref={dropzoneRef}>
                        <Toolbar />
                        <Uploads
                            onRemoveFile={onFileRemoved}
                            uploads={op.get(state, 'uploads', {})}
                        />
                        <List
                            data={mapLibraryToList(state.library)}
                            empty={isEmpty()}
                        />
                    </Dropzone>
                ) : (
                    <div className={cx('spinner')}>
                        <Spinner />
                    </div>
                )}
            </>
        );
    };

    return render();
};

const mapLibraryToList = library => _.indexBy(library, 'objectId');

Media = forwardRef(Media);

Media.ENUMS = ENUMS;

Media.defaultProps = {
    dropzoneProps: {
        config: {
            chunking: false,
            clickable: true,
            previewTemplate:
                '<div class="dz-preview dz-file-preview"><span data-dz-name></div>',
        },
        debug: false,
    },
    namespace: 'admin-media',
    title: ENUMS.TEXT.TITLE,
};

export { Media as default };
