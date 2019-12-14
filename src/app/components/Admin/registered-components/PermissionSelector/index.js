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

import Reactium, { useRegisterHandle } from 'reactium-core/sdk';

import { Button, Dropdown, Icon, TagsInput } from '@atomic-reactor/reactium-ui';

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: PermissionSelector
 * -----------------------------------------------------------------------------
 */
let PermissionSelector = ({ children, ...props }, ref) => {
    // Refs
    const containerRef = useRef();
    const stateRef = useRef({
        ...props,
        canRead: [],
        canWrite: [],
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
                label: ENUMS.TEXT.FOLDER_EDITOR.CAN_VIEW,
                icon: 'Feather.Eye',
                value: 'read',
            },
            {
                label: ENUMS.TEXT.FOLDER_EDITOR.CAN_EDIT,
                icon: 'Feather.Edit2',
                value: 'write',
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
        const roles = op.get(data, 'roles', []);
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

    const getLabels = ({ selection, data }) =>
        _.pluck(
            data.filter(({ value, label }) => {
                return selection.includes(value);
            }),
            'label',
        ).join(', ');

    const getValue = () => {
        const data = op.get(stateRef.current, 'data') || {
            roles: [],
            users: [],
        };
        const { canRead = [], canWrite = [] } = stateRef.current;
        const selected = canRead.concat(canWrite);

        const roles = data.roles
            .filter(({ objectId }) => selected.includes(objectId))
            .map(item => {
                item.type = 'role';
                item.permission = canWrite.includes(item.objectId)
                    ? 'write'
                    : 'read';
                return item;
            });

        const users = data.users
            .filter(({ objectId }) => selected.includes(objectId))
            .map(item => {
                item.type = 'user';
                item.permission = canWrite.includes(item.objectId)
                    ? 'write'
                    : 'read';
                return item;
            });

        return roles.concat(users);
    };

    const addItems = () => {
        let {
            canWrite = [],
            canRead = [],
            permission,
            selection,
        } = stateRef.current;
        let sel = permission === 'read' ? canRead : canWrite;
        sel = _.chain(sel.concat(selection))
            .compact()
            .uniq()
            .value();

        setState({
            permission: 'read',
            search: null,
            canWrite: permission !== 'read' ? sel : canWrite,
            canRead: permission === 'read' ? sel : canRead,
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
        let { canWrite = [], canRead = [] } = stateRef.current;

        if (name === 'view') canRead = value;
        if (name === 'write') canWrite = value;

        setState({ canWrite, canRead });
    };

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
                    <label className='input-group' style={{ width: '100%' }}>
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
                    onClick={addItems}
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

    const renderCanWrite = () => {
        const { canWrite = [] } = stateRef.current;
        if (canWrite.length < 1) return;

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
                    name='write'
                    value={canWrite}
                    onChange={onTagsChange}
                    formatter={e => tagFormatter(e)}
                />
            </div>
        );
    };

    const renderCanRead = () => {
        const { canRead = [] } = stateRef.current;
        if (canRead.length < 1) return;

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
                    value={canRead}
                    onChange={onTagsChange}
                    formatter={e => tagFormatter(e)}
                />
            </div>
        );
    };

    const cname = () => {
        const { namespace, className } = stateRef.current;
        return cn({ [namespace]: !!namespace, [className]: !!className });
    };

    // Renderer
    const render = () => {
        return (
            <div className={cname()} ref={ref}>
                {renderUserSelect()}
                <div className='selections'>
                    {renderCanWrite()}
                    {renderCanRead()}
                </div>
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

    useEffect(() => {
        const { onChange, canWrite = [], canRead = [] } = stateRef.current;

        onChange({
            type: 'change',
            value: getValue(),
        });
    }, [
        op.get(stateRef.current, 'canRead'),
        op.get(stateRef.current, 'canWrite'),
    ]);

    // External Interface
    const handle = () => ({
        container: containerRef.current,
        ref,
        setState,
        state: stateRef.current,
        value: getValue(),
    });

    useRegisterHandle('PermissionSelector', handle, [
        op.get(stateRef.current, 'canRead'),
        op.get(stateRef.current, 'canWrite'),
    ]);

    useImperativeHandle(ref, handle);

    // Render
    return render();
};

PermissionSelector = forwardRef(PermissionSelector);

PermissionSelector.ENUMS = ENUMS;

PermissionSelector.propTypes = {
    canWrite: PropTypes.array,
    canRead: PropTypes.array,
    className: PropTypes.string,
    data: PropTypes.object,
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    permission: PropTypes.oneOf(['read', 'write']),
    search: PropTypes.string,
    selection: PropTypes.array,
};

PermissionSelector.defaultProps = {
    data: null,
    namespace: 'permission-selector',
    onChange: noop,
    permission: 'read',
    search: null,
    selection: [],
};

export { PermissionSelector as default };
