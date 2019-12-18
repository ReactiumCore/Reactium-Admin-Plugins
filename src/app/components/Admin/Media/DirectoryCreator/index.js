import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import domain from '../domain';
import PropTypes from 'prop-types';
import ENUMS from 'components/Admin/Media/enums';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

import Reactium, {
    useHandle,
    useHookComponent,
    useReduxState,
} from 'reactium-core/sdk';

import {
    Alert,
    Button,
    Dialog,
    Icon,
    Spinner,
} from '@atomic-reactor/reactium-ui';

const noop = forwardRef((props, ref) => null);

let FolderInput = ({ value }, ref) => (
    <div className='pl-xs-16 mb-xs-8'>
        <label className='input-group' style={{ width: '100%' }}>
            <span className='blue'>
                <Icon name='Feather.Folder' className='mr-xs-4' />
            </span>
            <input
                type='text'
                ref={ref}
                name='directory'
                defaultValue={value || ''}
                placeholder={ENUMS.TEXT.FOLDER_CREATOR.DIRECTORY}
            />
        </label>
    </div>
);

FolderInput = forwardRef(FolderInput);

/**
 * -----------------------------------------------------------------------------
 * Hook Component: DirectoryCreator
 * -----------------------------------------------------------------------------
 */
let DirectoryCreator = ({ children, ...props }, ref) => {
    const [getState, dispatch] = useReduxState(domain.name);

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const Toast = op.get(tools, 'Toast');

    const PermissionSelector = useHookComponent('PermissionSelector', noop);

    // Refs
    const containerRef = useRef();
    const folderRef = useRef();
    const permRef = useRef();
    const stateRef = useRef({
        ...props,
        data: null,
        error: null,
        status: ENUMS.STATUS.READY,
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

    const cname = () => {
        const { className, namespace } = stateRef.current;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    const save = async () => {
        const { status } = stateRef.current;
        if (status === ENUMS.STATUS.PROCESSING) return;

        const permissions = permRef.current;
        const { value: directory } = folderRef.current;

        if (!directory) return;

        // Optimistically update the store
        let { directories = [] } = getState;

        directories.push(directory);
        directories.sort();
        directories = _.uniq(directories);

        dispatch({ directories });

        onSave({ directory, permissions });

        Reactium.Cloud.run('directory-create', {
            directory,
            permissions: permissions.value,
        })
            .then(result => {
                Toast.show({
                    icon: 'Feather.Check',
                    message: `Saved ${directory}`,
                    type: Toast.TYPE.INFO,
                });
                Modal.hide();
            })
            .catch(err =>
                onError({
                    directory,
                    permissions,
                    error: err,
                }),
            );
    };

    const onSave = e => {
        const { directory, permissions } = e;
        const { canRead = [], canWrite = [] } = permissions.state;

        setState({
            canRead,
            canWrite,
            directory,
            error: null,
            status: ENUMS.STATUS.PROCESSING,
        });
    };

    const onError = e => {
        const { directory, error, permissions } = e;
        const { canRead = [], canWrite = [] } = permissions.state;

        setState({
            canRead,
            canWrite,
            directory,
            error,
            status: ENUMS.STATUS.READY,
        });
    };

    const footer = () => ({
        elements: [
            <Button
                color='danger'
                outline
                size='sm'
                onClick={() => Modal.hide()}>
                Cancel
            </Button>,
            <Button
                color='primary'
                size='sm'
                onClick={save}
                style={{ width: 175, marginLeft: 8 }}>
                {ENUMS.TEXT.FOLDER_CREATOR.SAVE}
            </Button>,
        ],
    });

    // Renderer
    const render = () => {
        const {
            canRead = [],
            canWrite = [],
            directory,
            error,
            status,
        } = stateRef.current;
        return (
            <div ref={containerRef} className={cname()}>
                <Dialog
                    collapsible={false}
                    dismissable={true}
                    footer={footer()}
                    header={{ title: ENUMS.TEXT.FOLDER_CREATOR.TITLE }}
                    onDismiss={() => Modal.hide()}>
                    <div
                        className='py-xs-16'
                        style={{ minHeight: 120, position: 'relative' }}>
                        {error && (
                            <div className='px-xs-16 py-xs-16 mt-xs--16 mb-xs-8 bg-red white text-center italic'>
                                {op.get(error, 'message')}
                            </div>
                        )}
                        <FolderInput ref={folderRef} value={directory} />
                        <PermissionSelector
                            canRead={canRead}
                            canWrite={canWrite}
                            ref={permRef}
                        />
                        {status === ENUMS.STATUS.PROCESSING && (
                            <div
                                className='flex middle center'
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 100000,
                                }}>
                                <Spinner />
                            </div>
                        )}
                    </div>
                </Dialog>
            </div>
        );
    };

    // Render
    return render();
};

DirectoryCreator = forwardRef(DirectoryCreator);

DirectoryCreator.ENUMS = ENUMS;

DirectoryCreator.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    permissions: PropTypes.object,
};

DirectoryCreator.defaultProps = {
    namespace: 'admin-directory-editor',
    permissions: {},
};

export { DirectoryCreator as default };
