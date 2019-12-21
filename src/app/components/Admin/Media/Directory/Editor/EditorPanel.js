import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ENUMS from 'components/Admin/Media/enums';
import domain from 'components/Admin/Media/domain';
import { FolderInput } from 'components/Admin/Media/Directory/Creator';

import Reactium, {
    useHandle,
    useHookComponent,
    useReduxState,
    useSelect,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

import { Alert, Button, DataTable, Icon } from '@atomic-reactor/reactium-ui';

const noop = forwardRef((props, ref) => null);

const EditorPanel = forwardRef((props, ref) => {
    const List = useHandle('MediaDirectories');

    const PermissionSelector = useHookComponent('PermissionSelector', noop);

    const folderRef = useRef();

    const idRef = useRef();

    const permRef = useRef();

    const stateRef = useRef({
        ...props,
    });

    const [, forceRender] = useState(stateRef.current);

    const setState = newState => {
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        forceRender(stateRef.current);
    };

    const reset = (newState = {}) => {
        const state = {
            ...EditorPanel.defaultProps,
            ...newState,
        };
        setState(state);
    };

    const save = async () => {
        const { status } = stateRef.current;
        if (status === ENUMS.STATUS.PROCESSING) return;

        const permissions = permRef.current;
        const objectId = op.get(idRef.current, 'value');
        const { value: directory } = folderRef.current;

        if (!directory) return;

        // Save values to state
        onSave({ directory, permissions, objectId });

        // Create the object
        List.saveDirectory({
            directory,
            objectId,
            permissions: permissions.value,
        })
            .then(result => onSuccess(result))
            .catch(error => onError(error));
    };

    const onSave = e => {
        const { directory, objectId, permissions } = e;
        const { canRead = [], canWrite = [] } = permissions.state;

        setState({
            canRead,
            canWrite,
            directory,
            error: null,
            objectId,
            status: ENUMS.STATUS.PROCESSING,
        });
    };

    const onSuccess = result =>
        setState({
            error: null,
            objectId: result.objectId,
            status: ENUMS.STATUS.READY,
        });

    const onError = error => setState({ error, status: ENUMS.STATUS.READY });

    const render = () => {
        const {
            canRead,
            canWrite,
            directory,
            error,
            id,
            objectId,
        } = stateRef.current;

        return (
            <div id={id} className='admin-directory-editor' ref={ref}>
                <input
                    type='hidden'
                    name='objectId'
                    value={objectId || ''}
                    ref={idRef}
                />
                {error && (
                    <div className='px-xs-16 py-xs-16 mt-xs--16 mb-xs-8 bg-red white text-center italic'>
                        {op.get(error, 'message')}
                    </div>
                )}
                <FolderInput
                    name='directory'
                    onChange={e => setState({ directory: e.target.value })}
                    ref={folderRef}
                    value={directory || ''}
                />
                <PermissionSelector
                    canRead={canRead}
                    canWrite={canWrite}
                    ref={permRef}
                />
            </div>
        );
    };

    useImperativeHandle(ref, () => ({
        reset,
        save,
        setState,
        state: stateRef.current,
    }));

    return render();
});

EditorPanel.defaultProps = {
    canRead: [],
    canWrite: [],
    directory: null,
    error: null,
    objectId: null,
    status: ENUMS.STATUS.INIT,
};

export default EditorPanel;
