import dz from 'dropzone';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Dropzone
 * -----------------------------------------------------------------------------
 */
let Dropzone = (
    {
        children,
        onChange,
        onError,
        onFileAdded,
        onFileRemoved,
        onInitialize,
        ...props
    },
    ref,
) => {
    // Refs
    const containerRef = useRef();
    const dzRef = useRef();
    const initRef = useRef(false);
    const inputRef = useRef();
    const prevStateRef = useRef({});
    const stateRef = useRef({
        ...props,
        config: { ...Dropzone.defaultProps.config, ...props.config },
        initialized: initRef.current,
    });

    // State
    const [state, setNewState] = useState(stateRef.current);
    const [prevState, setPrevState] = useState(prevStateRef.current);

    const [updated, setUpdated] = useState(Date.now());

    // Internal Interface
    const setState = (newState, caller) => {
        const { debug } = stateRef.current;

        newState = { ...stateRef.current, ...newState };

        if (debug === true) {
            console.log('setState()', caller, newState);
        }

        prevStateRef.current = { ...stateRef.current };
        stateRef.current = newState;

        setNewState(stateRef.current);
        setPrevState(prevStateRef.current);
        setUpdated(Date.now());
    };

    const _onFileAdded = file => {
        const { config, max = 0 } = stateRef.current;
        const { maxFiles = 0 } = config;

        if (maxFiles > 0 && max >= maxFiles) {
            return;
        }

        setState({ files: dzRef.current.getAcceptedFiles() }, '_onFileAdded()');

        const evt = {
            type: 'added',
            file,
            files: dzRef.current.getAcceptedFiles(),
        };

        onFileAdded(evt);
    };

    const _onFileRemoved = file => {
        setState(
            { max: dzRef.current.getAcceptedFiles().length },
            '_onFileRemoved()',
        );

        const evt = {
            type: 'removed',
            file,
            files: dzRef.current.getAcceptedFiles(),
        };

        onFileRemoved(evt);
    };

    const _onFileError = (file, error) => {
        const { files } = stateRef.current;

        const evt = {
            type: 'error',
            file,
            files,
            error,
        };

        onError(evt);
    };

    const _onMaxFilesReached = () => {
        setState(
            { max: dzRef.current.getAcceptedFiles().length },
            '_onMaxFilesReached()',
        );
    };

    const addFiles = files => {
        const { disabled } = stateRef.current;
        if (disabled === true) {
            return;
        }

        files = typeof files === 'string' ? [files] : files;
        files = _.compact(files);

        if (files.length < 1) {
            return;
        }

        const dzone = dzRef.current;

        files.forEach(file => {
            dzone.emit('addedfile', file);
            dzone.emit('thumbnail', file, file.dataURL);
        });
    };

    const removeFiles = files => {
        const { disabled } = stateRef.current;
        if (disabled === true) {
            return;
        }

        files = typeof files === 'string' ? [files] : files;
        files = _.compact(files);

        if (files.length < 1) {
            return;
        }

        const dzone = dzRef.current;

        files.forEach(file => dzone.removeFile(file));
    };

    const select = () => {
        const { disabled } = stateRef.current;
        if (disabled === true) {
            return;
        }

        const input = inputRef.current;

        if (input) {
            input.click();
        }
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        addFiles,
        removeFiles,
        select,
        container: containerRef.current,
        prevState: prevStateRef.current,
        props,
        setState,
        state: stateRef.current,
        files: {
            list: stateRef.current.files,
            remove: file => dzRef.current.removeFile(file),
        },
    }));

    // Side Effects
    useEffect(() => {
        const { initialized } = stateRef.current;

        // Dispatch onChange event
        const { files: currFiles } = stateRef.current;
        const { files: prevFiles } = prevState;

        if (
            JSON.stringify(currFiles) !== JSON.stringify(prevFiles) &&
            initialized === true
        ) {
            const evt = { type: 'change', ...state };
            onChange(evt);
        }
    }, [updated]);

    useLayoutEffect(() => {
        if (!dzRef.current) {
            const { config, files = [] } = stateRef.current;
            let { maxFiles } = config;
            maxFiles = maxFiles < 1 ? null : maxFiles;

            try {
                const dzs = document.querySelector('.dz-hidden-input');
                if (dzs) {
                    dzs.parentNode.removeChild(dzs);
                }
            } catch (err) {}

            const configTmp = { ...config, maxFiles };

            if (!op.get(configTmp, 'previewsContainer')) {
                configTmp.previewsContainer = '.ar-dropzone-preview';
            }

            const dzone = new dz(containerRef.current, configTmp);

            dzRef.current = dzone;
            initRef.current = true;

            setState({ initialized: initRef.current }, 'useLayoutEffect()');

            if (files) {
                addFiles(files);
            }

            onInitialize({
                type: 'initialize',
                dropzone: dzRef.current,
                files,
            });

            dzRef.current.on('maxfilesreached', _onMaxFilesReached);
            dzRef.current.on('addedfile', _onFileAdded);
            dzRef.current.on('removedfile', _onFileRemoved);
            dzRef.current.on('error', _onFileError);

            inputRef.current = document.querySelector('.dz-hidden-input');
        }
    });

    const render = () => {
        const { config, className, namespace } = stateRef.current;
        const previewsContainer = op.get(config, 'previewsContainer');
        return (
            <div
                ref={containerRef}
                className={cn({ [className]: !!className, [namespace]: true })}>
                {!previewsContainer && <div className='ar-dropzone-preview' />}
                {children}
            </div>
        );
    };

    return render();
};

Dropzone = forwardRef(Dropzone);

Dropzone.propTypes = {
    config: PropTypes.shape({
        acceptedFiles: PropTypes.string,
        autoProcessQueue: PropTypes.bool,
        clickable: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
        maxFiles: PropTypes.number,
        method: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        parallelUploads: PropTypes.number,
        paramName: PropTypes.string,
        previewsContainer: PropTypes.string,
        timeout: PropTypes.number,
        uploadMultiple: PropTypes.bool,
    }),
    className: PropTypes.string,
    debug: PropTypes.bool,
    disabled: PropTypes.bool,
    files: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    onFileAdded: PropTypes.func,
    onFileRemoved: PropTypes.func,
    onInitialize: PropTypes.func,
};

Dropzone.defaultProps = {
    config: {
        acceptedFiles: null,
        autoProcessQueue: false,
        clickable: true,
        maxFiles: 0,
        method: 'post',
        parallelUploads: 1,
        paramName: 'file',
        previewsContainer: null,
        timeout: 30000,
        uploadMultiple: false,
        url: '#',
    },
    className: 'fullwidth',
    debug: true,
    disabled: false,
    namespace: 'ar-dropzone',
    onChange: noop,
    onError: noop,
    onFileAdded: noop,
    onFileRemoved: noop,
    onInitialize: noop,
};

export { Dropzone as default };
