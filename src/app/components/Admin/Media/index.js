import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ENUMS from './enums';

import {
    useDocument,
    useHandle,
    useRegisterHandle,
    useSelect,
    useStore,
    useWindowSize,
} from 'reactium-core/sdk';

import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Dropzone from './Dropzone';
// import { Button, Dropzone, Icon } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useImperativeHandle,
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
let Media = ({ dropzoneProps, zone }, ref) => {
    const iDoc = useDocument();

    const { breakpoint } = useWindowSize();

    const { dispatch } = useStore();

    const reduxState = useSelect(state => op.get(state, 'Media'));

    const SearchBar = useHandle('SearchBar');

    // Refs
    const containerRef = useRef();
    const dropzoneRef = useRef();
    const stateRef = useRef({
        ...reduxState,
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

    const cx = cls => _.compact([`zone-${zone}`, cls]).join('-');

    const isEmpty = () => op.get(stateRef.current, 'library', []).length < 1;

    const isUploading = () => op.get(stateRef.current, 'files', []).length > 0;

    const onBrowseClick = () => dropzoneRef.current.select();

    const onFileAdded = e => {
        const { file } = e;

        const reader = new FileReader();
        reader.onload = ({ target }) => {
            const { files = [] } = stateRef.current;
            file.dataURL = target.result;
            files.push(file);
            setState({ files });
        };
        reader.readAsDataURL(file);
    };

    const Uploads = ({ files }) => {
        const getType = file => file.type.split('/').pop();

        const isImage = file =>
            ['png', 'svg', 'gif', 'jpg', 'jpeg'].includes(getType(file));

        const getIcon = file => {
            const type = getType(file);
            const { status } = file;

            return null;
        };

        // .filter(({ status }) => Boolean(status !== 'completed'))

        return files.length < 1 ? null : (
            <ul>
                {files.map((file, i) => {
                    const { status } = file;
                    const style = isImage(file)
                        ? { backgroundImage: `url(${file.dataURL})` }
                        : null;
                    return (
                        <li
                            key={`media-upload-${i}`}
                            className={cn(status, cx('upload'))}>
                            <div
                                className={cn(status, cx('upload-image'))}
                                children={getIcon(file)}
                                style={style}
                            />
                            <div className={cn(status, cx('upload-name'))}>
                                {file.name}
                            </div>
                            <div className={cn(status, cx('upload-action'))}>
                                <Button
                                    size='xs'
                                    color='danger'
                                    appearance='circle'>
                                    <Icon name='Feather.X' size={18} />
                                </Button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    };

    const RenderEmpty = () => (
        <div className='label'>
            <Icon
                name='Linear.CloudUpload'
                size={['xs', 'sm'].includes(breakpoint) ? 96 : 128}
            />
            <div className='my-xs-32 my-md-40'>{ENUMS.TEXT.EMPTY}</div>
            <Button
                size={['xs', 'sm'].includes(breakpoint) ? 'md' : 'lg'}
                color='primary'
                appearance='pill'
                onClick={onBrowseClick}>
                {ENUMS.TEXT.BROWSE}
            </Button>
        </div>
    );

    // Renderer
    const render = () => {
        const empty = isEmpty();
        const { files = [] } = stateRef.current;

        return (
            <div ref={containerRef}>
                <Dropzone
                    className={cx('dropzone')}
                    files={files}
                    ref={dropzoneRef}
                    {...dropzoneProps}
                    onFileAdded={onFileAdded}>
                    <div className={cx('uploads')}>
                        <Uploads {...stateRef.current} />
                    </div>
                    <div className={cn(cx('library'), { empty: !!empty })}>
                        {empty && <RenderEmpty />}
                    </div>
                </Dropzone>
            </div>
        );
    };

    useEffect(() => SearchBar.setState({ visible: !isEmpty() }), [
        op.get(SearchBar, 'visible'),
        op.get(stateRef.current, 'library', []).length,
    ]);

    // External Interface
    const handle = () => ({
        ENUMS,
        ref,
        setState,
        state: stateRef.current,
    });

    useImperativeHandle(ref, handle);

    useRegisterHandle('Media', handle, [
        op.get(stateRef.current, 'files', []).length,
        op.get(stateRef.current, 'library', []).length,
    ]);

    // Render
    return render();
};

Media = forwardRef(Media);

Media.ENUMS = ENUMS;

Media.defaultProps = {
    dropzoneProps: {
        config: {
            clickable: true,
            previewTemplate:
                '<div class="dz-preview dz-file-preview"><span data-dz-name></div>',
        },
        debug: false,
    },
};

export { Media as default };
