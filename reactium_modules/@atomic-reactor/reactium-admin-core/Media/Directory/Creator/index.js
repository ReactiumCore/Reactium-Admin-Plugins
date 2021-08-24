import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import slugify from 'slugify';
import PropTypes from 'prop-types';
import ENUMS from 'reactium_modules/@atomic-reactor/reactium-admin-core/Media/enums';
import domain from 'reactium_modules/@atomic-reactor/reactium-admin-core/Media/domain';
import { Scrollbars } from 'react-custom-scrollbars';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

import Reactium, {
    useDerivedState,
    useHandle,
    useHookComponent,
} from 'reactium-core/sdk';

import { useReduxState } from '@atomic-reactor/use-select';

import {
    Alert,
    Button,
    Dialog,
    Icon,
    Spinner,
} from '@atomic-reactor/reactium-ui';

const noop = forwardRef((props, ref) => null);

let FolderInput = (props, ref) => (
    <div className='pl-xs-16 mb-xs-8'>
        <label className='input-group' style={{ width: '100%' }}>
            <span className='blue'>
                <Icon name='Feather.Folder' className='mr-xs-4' />
            </span>
            <input
                type='text'
                ref={ref}
                name='directory'
                onBlur={e => {
                    e.target.value = String(
                        slugify(e.target.value),
                    ).toLowerCase();
                }}
                placeholder={ENUMS.TEXT.FOLDER_CREATOR.DIRECTORY}
                {...props}
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

    // State
    const [state, setNewState] = useDerivedState({
        ...props,
        data: null,
        error: null,
        status: ENUMS.STATUS.READY,
    });

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const cname = () => {
        const { className, namespace } = state;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    const footer = () => ({
        elements: [
            <Button
                color='primary'
                size='sm'
                onClick={save}
                style={{ width: 175, marginLeft: 8 }}>
                {ENUMS.TEXT.FOLDER_CREATOR.SAVE}
            </Button>,
        ],
    });

    const isMounted = () => !unMounted();

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

    const save = async () => {
        const { status } = state;
        if (status === ENUMS.STATUS.PROCESSING) return;

        const permissions = permRef.current;
        let { value: directory } = folderRef.current;

        if (!directory) return;

        directory = String(slugify(directory)).toLowerCase();

        // Optimistically update the store
        let { directories = [] } = getState;

        directories.push(directory);
        directories.sort();
        directories = _.uniq(directories);

        dispatch({ directories });

        onSave({ directory, permissions });

        Reactium.Cloud.run('directory-save', {
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

    const unMounted = () => !containerRef.current;

    // Renderer
    const render = () => {
        const { canRead = [], canWrite = [], directory, error, status } = state;

        return (
            <div ref={containerRef} className={cname()}>
                <Dialog
                    collapsible={false}
                    dismissable={true}
                    footer={footer()}
                    header={{ title: ENUMS.TEXT.FOLDER_CREATOR.TITLE }}
                    onDismiss={() => Modal.hide()}>
                    <div style={{ position: 'relative', height: 300 }}>
                        <Scrollbars height={300}>
                            {error && (
                                <div className='px-xs-16 py-xs-16 mb-xs-8 bg-red white text-center italic'>
                                    {op.get(error, 'message')}
                                </div>
                            )}
                            <div className='py-xs-16'>
                                <FolderInput
                                    ref={folderRef}
                                    defaultValue={directory}
                                />
                                <PermissionSelector
                                    canRead={canRead}
                                    canWrite={canWrite}
                                    ref={permRef}
                                />
                            </div>
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
                        </Scrollbars>
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

export { DirectoryCreator as default, FolderInput };
