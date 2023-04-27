import uuid from 'uuid/v4';
import dz from 'dropzone';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

const useLayoutEffect =
    typeof window === 'undefined' ? useEffect : useWindowEffect;

const noop = () => {};

const ENUMS = {
    DEBUG: false,
    EVENT: {
        ADD: 'add',
        CHANGE: 'change',
        ERROR: 'error',
        INIT: 'init',
        REMOVE: 'remove',
    },
};

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
    const inputContainerRef = useRef();
    const stateRef = useRef({
        ...props,
        config: { ...Dropzone.defaultProps.config, ...props.config },
        dropzone: null,
        initialized: false,
        input: null,
    });

    // State
    const [, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = (newState, caller) => {
        if (ENUMS.DEBUG && caller) {
            console.log(caller, {
                state: stateRef.current,
                newState,
                merged: { ...stateRef.current, ...newState },
            });
        }

        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
            updated: Date.now(),
        };

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const state = (key, defaultValue) =>
        key ? op.get(stateRef.current, key, defaultValue) : stateRef.current;

    const cname = () => {
        const { className, namespace } = state();
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    const cx = cls => {
        const { namespace } = state();
        return _.compact([namespace, cls]).join('-');
    };

    const clearPreviousInput = () => {
        const container = inputContainerRef.current;
        const input = container.querySelector('.dz-hidden-input');
        if (input) {
            input.parentNode.removeChild(input);
        }
    };

    const mapconfig = () => {};

    const getType = filename =>
        String(filename)
            .split('.')
            .pop();

    const isImage = filename =>
        ['png', 'svg', 'gif', 'jpg', 'jpeg'].includes(getType(filename));

    const _onFileAdded = file => addFiles([file]);

    const _onFileRemoved = file => removeFiles([file]);

    const _onFileError = (file, error) => {
        const reader = new FileReader();

        reader.onload = ({ target }) => {
            removeFiles(file);

            const files = state('files', {});

            onError({
                type: ENUMS.EVENT.ERROR,
                file,
                files,
                message: String(error).toLowerCase(),
            });

            onChange({
                type: ENUMS.EVENT.CHANGE,
                added: null,
                removed: null,
                files,
            });
        };

        reader.readAsDataURL(file);
    };

    const addFiles = files => {
        let Q = state('files', {});
        files = !Array.isArray(files) ? [files] : files;
        files = _.compact(files);

        if (files.length < 1) {
            return Promise.resolve(Q);
        }

        const dropzone = state('dropzone');
        const added = [];

        return new Promise(resolve => {
            const ival = setInterval(() => {
                if (added.length === files.length) {
                    clearInterval(ival);

                    Q = state('files', {});

                    setState({ files: Q }, 'addFiles');

                    if (_.compact(added).length > 0) {
                        onFileAdded({
                            type: ENUMS.EVENT.ADD,
                            added: _.compact(added),
                            files: Q,
                        });

                        onChange({
                            type: ENUMS.EVENT.CHANGE,
                            added: _.compact(added),
                            removed: null,
                            files: Q,
                        });
                    }

                    resolve(Q);
                }
            }, 1);

            files.forEach(file => {
                if (file.status === ENUMS.EVENT.ERROR) {
                    added.push(null);
                    return;
                }

                const obj = file;

                const ID = uuid();
                obj['ID'] = ID;
                obj['statusAt'] = Date.now();

                if (isImage(file.name)) {
                    const reader = new FileReader();

                    reader.onload = ({ target }) => {
                        obj['dataURL'] = target.result;
                        obj['statusAt'] = Date.now();

                        Q[ID] = obj;

                        added.push(obj);
                    };

                    reader.readAsDataURL(file);
                } else {
                    Q[ID] = obj;
                    added.push(obj);
                }
            });
        });
    };

    const removeFiles = files => {
        files = !Array.isArray(files) ? [files] : files;
        files = _.compact(files);

        if (files.length < 1) {
            return;
        }

        const Q = state('files', {});
        const dropzone = state('dropzone');

        files.forEach(file => {
            const ID = file.ID;

            if (!Q[ID]) {
                return;
            }

            delete Q[ID];
            stateRef.current.files = Q;

            try {
                dropzone.removeFile(file);
            } catch (err) {}
        });

        setState({ files: Q }, 'removeFiles');

        onFileRemoved({
            type: ENUMS.EVENT.REMOVE,
            removed: files,
            files: Q,
        });

        onChange({
            type: ENUMS.EVENT.CHANGE,
            added: null,
            removed: files,
            files: Q,
        });
    };

    const browseFiles = () => {
        const container = inputContainerRef.current;
        const input = container.querySelector('.dz-hidden-input');

        if (input) {
            input.click();
        }
    };

    const initialize = () => {
        const initialized = state('initialized');
        if (initialized === true) {
            return;
        }

        clearPreviousInput();

        const config = state('config');
        const files = state('files', {});
        const container = containerRef.current;

        if (!state('config.previewsContainer')) {
            config.previewsContainer = `.${cx('preview')}`;
        }

        if (!state('config.hiddenInputContainer')) {
            config.hiddenInputContainer = `.${cx('input')}`;
        }

        const dropzone = new dz(container, config);

        dropzone.on('addedfile', _onFileAdded);
        dropzone.on('error', _onFileError);
        dropzone.on('removedfile', _onFileRemoved);

        const inputContainer = inputContainerRef.current;
        const input = inputContainer.querySelector('.dz-hidden-input');

        setState({ config, dropzone, initialized: true, input }, 'initialize');

        addFiles(Object.values(files)).then(files => {
            onInitialize({
                type: ENUMS.EVENT.INIT,
                dropzone,
                files,
            });
        });
    };

    // Renderers
    const render = () => (
        <div ref={containerRef} className={cname()}>
            <div className={cx('input')} ref={inputContainerRef} />
            <div className={cx('preview')} />
            {children}
        </div>
    );

    // Side Effects
    useLayoutEffect(() => initialize(), [containerRef.current]);

    useEffect(() => {
        // Remove any errored files
        const staged = Object.values(state('files')).filter(file =>
            Boolean(file.status === ENUMS.EVENT.ERROR),
        );
        if (staged.length > 0) {
            removeFiles(staged);
        }
    }, [state('updated')]);

    // External Interface
    useImperativeHandle(ref, () => ({
        ...ref,
        addFiles,
        browseFiles,
        container: containerRef.current,
        dropzone: state('dropzone'),
        props,
        removeFiles,
        setState,
        state: state(),
    }));

    return render();
};

Dropzone = forwardRef(Dropzone);

Dropzone.propTypes = {
    config: PropTypes.shape({
        acceptedFiles: PropTypes.string,
        autoProcessQueue: PropTypes.bool,
        clickable: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
        hiddenInputContainer: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element,
        ]),
        maxFiles: PropTypes.number,
        method: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        parallelUploads: PropTypes.number,
        paramName: PropTypes.string,
        previewsContainer: PropTypes.string,
        timeout: PropTypes.number,
        uploadMultiple: PropTypes.bool,
    }),
    className: PropTypes.string,
    disabled: PropTypes.bool,
    files: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
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
        hiddenInputContainer: null,
        maxFiles: null,
        method: 'post',
        parallelUploads: 1,
        paramName: 'file',
        previewsContainer: null,
        timeout: 30000,
        uploadMultiple: false,
        url: '#',
    },
    disabled: false,
    files: {},
    namespace: 'ar-dropzone',
    onChange: noop,
    onError: noop,
    onFileAdded: noop,
    onFileRemoved: noop,
    onInitialize: noop,
};

export { Dropzone, Dropzone as default };
