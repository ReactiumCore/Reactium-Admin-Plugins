import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import ENUMS from 'components/Admin/Media/enums';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

import Reactium, { useHandle, useHookComponent } from 'reactium-core/sdk';

import { Button, Dialog, Icon } from '@atomic-reactor/reactium-ui';

const noop = forwardRef((props, ref) => null);

/**
 * -----------------------------------------------------------------------------
 * Hook Component: DirectoryEditor
 * -----------------------------------------------------------------------------
 */
let DirectoryEditor = ({ children, ...props }, ref) => {
    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const PermissionSelector = useHookComponent('PermissionSelector', noop);

    // Refs
    const containerRef = useRef();
    const permRef = useRef();
    const stateRef = useRef({
        ...props,
        data: null,
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

    const renderFolderInput = () => (
        <div className='pl-xs-16 mb-xs-8'>
            <label className='input-group' style={{ width: '100%' }}>
                <span className='blue'>
                    <Icon name='Feather.Folder' className='mr-xs-4' />
                </span>
                <input
                    type='text'
                    name='directory'
                    placeholder={ENUMS.TEXT.FOLDER_EDITOR.DIRECTORY}
                />
            </label>
        </div>
    );

    const save = () => {
        const permissions = permRef.current;
        console.log(permissions.value);
    };

    // Renderer
    const render = () => {
        return (
            <div ref={containerRef} className={cname()}>
                <Dialog
                    collapsible={false}
                    dismissable={true}
                    onDismiss={() => Modal.hide()}
                    footer={{
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
                                {ENUMS.TEXT.FOLDER_EDITOR.SAVE}
                            </Button>,
                        ],
                    }}
                    header={{ title: ENUMS.TEXT.FOLDER_EDITOR.TITLE }}>
                    <div className='py-xs-16'>
                        {renderFolderInput()}
                        <PermissionSelector ref={permRef} />
                    </div>
                </Dialog>
            </div>
        );
    };

    // Render
    return render();
};

DirectoryEditor = forwardRef(DirectoryEditor);

DirectoryEditor.ENUMS = ENUMS;

DirectoryEditor.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    permissions: PropTypes.object,
};

DirectoryEditor.defaultProps = {
    namespace: 'admin-directory-editor',
    permissions: {},
};

export { DirectoryEditor as default };
