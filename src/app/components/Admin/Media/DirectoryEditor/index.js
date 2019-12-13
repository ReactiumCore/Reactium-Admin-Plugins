import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import ENUMS from 'components/Admin/Media/enums';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

import Reactium, { useHandle } from 'reactium-core/sdk';
import { Button, Dialog, Icon } from '@atomic-reactor/reactium-ui';

import Dropdown from 'components/Reactium-UI/Dropdown';
import TagsInput from 'components/Reactium-UI/TagsInput';

// Server-Side Render safe useLayoutEffect (useEffect when node)
const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: DirectoryEditor
 * -----------------------------------------------------------------------------
 */
let DirectoryEditor = ({ children, ...props }, ref) => {
    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    // Refs
    const containerRef = useRef();
    const stateRef = useRef({
        ...props,
        data: null,
    });
    const permissionSelect = useRef();
    const userSelect = useRef();

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

    const cx = () => {
        const { className, namespace } = stateRef.current;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    const permissions = () => {
        return [
            {
                label: ENUMS.TEXT.FOLDER_EDITOR.CAN_EDIT,
                icon: 'Feather.Edit2',
                value: 'write',
            },
            {
                label: ENUMS.TEXT.FOLDER_EDITOR.CAN_VIEW,
                icon: 'Feather.Eye',
                value: 'read',
            },
        ];
    };

    const onSearch = search => setState({ search });

    const onSelectUser = e => {
        const { selection } = e;
        setState({ selection });
    };

    const onSelectPermission = e => {
        try {
            const { value } = e.item;
            setState({ permission: value });
        } catch (err) {}
    };

    const reset = () => {
        setState({ ...props, search: null, selection: [] });
        permissionSelect.current.setState({ selection: [] });
        userSelect.current.setState({ selection: [] });
    };

    const getData = () => {
        const { data, selection = [] } = stateRef.current;

        if (!data) return;

        let output = [];
        let selected = [];

        // loop through roles
        const roles = _.sortBy(op.get(data, 'roles', []), 'label');
        roles.forEach(role => {
            let { objectId, label, name } = role;
            label = label || name;
            const item = { label, value: objectId, type: 'role' };

            if (selection.includes(objectId)) selected.push(item);
            else output.push(item);
        });

        // loop through users
        const users = op.get(data, 'users', []);
        users.forEach(user => {
            const { objectId, fname, lname, username } = user;
            const fullname = _.compact([fname, lname]).join(' ');
            const label = fullname.length > 0 ? fullname : username;
            const item = { label, value: objectId, type: 'user' };

            if (selection.includes(objectId)) selected.push(item);
            else output.push(item);
        });

        return selected.concat(output);
    };

    const addUsers = () => {
        let {
            canEdit = [],
            canView = [],
            permission,
            selection,
        } = stateRef.current;
        let sel = permission === 'read' ? canView : canEdit;
        sel = _.chain(sel.concat(selection))
            .compact()
            .uniq()
            .value();

        setState({
            permission: 'read',
            search: null,
            canEdit: permission !== 'read' ? sel : canEdit,
            canView: permission === 'read' ? sel : canView,
            selection: [],
        });

        userSelect.current.setState({ selection: [] });
        permissionSelect.current.setState({ selection: ['read'] });
    };

    const tagFormatter = value => {
        const data = getData();
        const item = _.findWhere(data, { value });
        return op.get(item, 'label', value);
    };

    const onTagsChange = ({ target, value }) => {
        const name = target.name;
        let { canEdit = [], canView = [] } = stateRef.current;

        if (name === 'view') canView = value;
        if (name === 'edit') canEdit = value;

        setState({ canEdit, canView });
    };

    const getLabels = ({ selection, data }) =>
        _.pluck(
            data.filter(({ value, label }) => {
                return selection.includes(value);
            }),
            'label',
        ).join(', ');

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

    const renderUserSelect = () => {
        const perms = permissions();
        const { permission, search, selection = [] } = stateRef.current;
        const perm = _.findWhere(perms, { value: permission });

        const data = getData();

        return (
            <div className='flex middle pl-xs-16 pr-xs-8 permission'>
                <span className='blue'>
                    <Icon name='Feather.User' className='mr-xs-4' />
                </span>
                <Dropdown
                    ref={userSelect}
                    data={data}
                    filter={search}
                    selection={selection}
                    onChange={onSelectUser}
                    collapseEvent='blur'
                    multiSelect
                    className='flex-grow'
                    maxHeight={250}
                    expandEvent={['focus', 'click']}>
                    <label className='input-group' style={{ flexGrow: 1 }}>
                        <input
                            type='text'
                            value={search || ''}
                            data-dropdown-element
                            placeholder={
                                selection.length > 0
                                    ? getLabels({ selection, data })
                                    : ENUMS.TEXT.FOLDER_EDITOR.USER
                            }
                            onChange={e => onSearch(e.target.value)}
                        />
                    </label>
                </Dropdown>
                <Dropdown
                    ref={permissionSelect}
                    data={perms}
                    iconField='ico'
                    onChange={onSelectPermission}
                    selection={[permission]}>
                    <Button
                        outline
                        color='tertiary'
                        size='sm'
                        style={{
                            padding: '6px 9px',
                            minWidth: 135,
                            justifyContent: 'flex-start',
                        }}
                        data-dropdown-element>
                        <Icon
                            size={16}
                            name={op.get(perm, 'icon')}
                            style={{ marginRight: 12 }}
                        />
                        {op.get(perm, 'label')}
                    </Button>
                </Dropdown>
                <Button
                    onClick={addUsers}
                    color='tertiary'
                    style={{
                        padding: 0,
                        width: 32,
                        height: 32,
                        marginLeft: 8,
                    }}>
                    <Icon size={20} name='Feather.Plus' />
                </Button>
            </div>
        );
    };

    const renderCanEdit = () => {
        const { canEdit = [] } = stateRef.current;
        if (canEdit.length < 1) return;

        return (
            <div className='px-xs-8 pt-xs-16'>
                <div className='flex middle mb-xs-4'>
                    <span className='blue'>
                        <Icon
                            name='Feather.Edit2'
                            size={24}
                            className='mr-xs-4 ml-xs-8'
                        />
                    </span>
                    <div className='px-xs-10 gray'>Can Edit</div>
                </div>
                <TagsInput
                    editable
                    name='edit'
                    value={canEdit}
                    onChange={onTagsChange}
                    formatter={e => tagFormatter(e)}
                />
            </div>
        );
    };

    const renderCanView = () => {
        const { canView = [] } = stateRef.current;
        if (canView.length < 1) return;

        return (
            <div className='px-xs-8 pt-xs-16'>
                <div className='flex middle mb-xs-4'>
                    <span className='blue'>
                        <Icon
                            name='Feather.Eye'
                            size={24}
                            className='mr-xs-4 ml-xs-8'
                        />
                    </span>
                    <div className='px-xs-10 gray'>Can View</div>
                </div>
                <TagsInput
                    editable
                    name='view'
                    value={canView}
                    onChange={onTagsChange}
                    formatter={e => tagFormatter(e)}
                />
            </div>
        );
    };

    // Renderer
    const render = () => {
        return (
            <div ref={containerRef} className={cx()}>
                <Dialog
                    collapsible={false}
                    dismissable={true}
                    onDismiss={() => Modal.hide()}
                    footer={{
                        elements: [
                            <Button
                                color='primary'
                                size='sm'
                                style={{ width: 175 }}>
                                {ENUMS.TEXT.FOLDER_EDITOR.SAVE}
                            </Button>,
                        ],
                    }}
                    header={{ title: ENUMS.TEXT.FOLDER_EDITOR.TITLE }}>
                    <div className='py-xs-16'>
                        {renderFolderInput()}
                        {renderUserSelect()}
                        <div className='selections'>
                            {renderCanEdit()}
                            {renderCanView()}
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    };

    // Side effects
    useEffect(() => {
        const { search } = stateRef.current;
    }, [op.get(stateRef.current, 'search')]);

    useEffect(() => {
        const { data, fetching } = stateRef.current;
        if (data || fetching) return;

        setState({ fetching: true });

        Reactium.Cloud.run('acl-targets').then(data =>
            setState({ data, fetching: false }),
        );
    }, [op.get(stateRef.current, 'data')]);

    // External Interface
    useImperativeHandle(ref, () => ({
        container: containerRef.current,
        ref,
        setState,
        state: stateRef.current,
    }));

    // Render
    return render();
};

DirectoryEditor = forwardRef(DirectoryEditor);

DirectoryEditor.ENUMS = ENUMS;

DirectoryEditor.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

DirectoryEditor.defaultProps = {
    canEdit: [],
    canView: [],
    namespace: 'admin-directory-editor',
    permission: 'read',
    search: null,
    selection: [],
};

export { DirectoryEditor as default };
