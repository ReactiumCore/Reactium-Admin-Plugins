import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import DeletePanel from './DeletePanel';
import EditorPanel from './EditorPanel';
import ENUMS from 'components/Admin/Media/enums';
import domain from 'components/Admin/Media/domain';
import { FolderInput } from 'components/Admin/Media/Directory/Creator';

import Reactium, {
    useHandle,
    useHookComponent,
    useReduxState,
    useRegisterHandle,
    useSelect,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    Alert,
    Button,
    DataTable,
    Dialog,
    Icon,
    Scene,
    Spinner,
    Toggle,
} from '@atomic-reactor/reactium-ui';

import { Column, Row, SearchBar } from '@atomic-reactor/reactium-ui/DataTable';

const noop = forwardRef((props, ref) => null);

/**
 * -----------------------------------------------------------------------------
 * Hook Component: DirectoryEditor
 * -----------------------------------------------------------------------------
 */
let DirectoryEditor = ({ className, namespace, ...props }, ref) => {
    const page = Number(
        useSelect(state => op.get(state, 'Router.params.page', 1)),
    );

    const [getState, dispatch] = useReduxState(domain.name);

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const Toast = op.get(tools, 'Toast');

    // Refs
    const dialogRef = useRef();

    const deleteRef = useRef();

    const editorRef = useRef();

    const sceneRef = useRef();

    const stateRef = useRef({
        active: 'list',
        deleteFiles: false,
        objectId: null,
        search: null,
        selection: [],
        status: ENUMS.STATUS.INIT,
    });

    const tableRef = useRef();

    // State
    const [, forceRender] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        // Trigger render()
        forceRender({ updated: Date.now(), keys: Object.keys(newState) });
    };

    const cname = () =>
        cn({ [className]: !!className, [namespace]: !!namespace });

    const cx = cls => _.compact([namespace, cls]).join('-');

    const onDeleteFilesChange = e => {
        const deleteFiles = e.target.checked;
        deleteRef.current.setState({ deleteFiles });
        stateRef.current.deleteFiles = deleteFiles;
    };

    const onItemSelect = e => {
        const { data = [] } = tableRef.current;
        const selection = data.filter(item => item.selected === true);
        setState({ selection });
    };

    const onSaveClick = e => {
        editorRef.current.save();
    };

    const onSceneBeforeChange = e => {
        const { staged } = e;

        if (staged === 'add') {
            const { edit } = stateRef.current;
            editorRef.current.reset(edit);
        }

        if (staged === 'delete') {
            const { item } = stateRef.current;
            deleteRef.current.setState({
                ...item,
                status: ENUMS.STATUS.READY,
                table: tableRef.current,
            });
        }
    };

    const onSceneChange = e => {
        const { active } = e;
        setState({ active });
    };

    const columns = () => {
        return {
            directory: {
                label: 'Folder',
                verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.MIDDLE,
                sortType: DataTable.ENUMS.SORT_TYPE.STRING,
            },
            actions: {
                label: '',
                verticalAlign: DataTable.ENUMS.VERTICAL_ALIGN.TOP,
                textAlign: 'right',
                width: 200,
            },
        };
    };

    const navTo = (panel, newState, direction = 'left') => {
        if (newState) setState(newState);

        sceneRef.current.navTo({
            panel,
            direction,
        });
    };

    const updateDirectories = directories => {
        directories = directories.map(item => {
            item.actions = <Actions {...item} />;
            return item;
        });

        setState({
            directories,
            status: ENUMS.STATUS.READY,
            updated: Date.now(),
        });
    };

    const Actions = item => {
        const size = 32;
        const margin = 12;
        const buttons = [];
        const canRead = [];
        const canWrite = [];
        const ACL = op.get(item, 'ACL', {});
        const { roles, users } = Reactium.Cache.get('acl-targets');

        Object.entries(ACL).forEach(([key, value]) => {
            if (key === '*') return;

            const { read, write } = value;
            const isRole = String(key).startsWith('role:');

            if (isRole) {
                const name = key.split(':').pop();
                const role = _.findWhere(roles, { name });
                if (read && !write) canRead.push(role);
                if (write) canWrite.push(role);
            } else {
                const user = _.findWhere(users, { objectId: key });
                if (read && !write) canRead.push(user);
                if (write) canWrite.push(user);
            }
        });

        buttons.push(
            <Button
                key={`edit-directory-${item.objectId}`}
                size='xs'
                style={{
                    padding: 0,
                    width: size,
                    height: size,
                    marginLeft: margin,
                }}
                data-tooltip={`${ENUMS.TEXT.FOLDER_EDITOR.EDIT} ${item.directory}`}
                data-align='left'
                data-vertical-align='middle'
                onClick={() =>
                    navTo('add', {
                        edit: {
                            ...item,
                            canRead: _.pluck(canRead, 'objectId'),
                            canWrite: _.pluck(canWrite, 'objectId'),
                            permissions: {
                                canRead,
                                canWrite,
                            },
                        },
                    })
                }>
                <Icon name='Feather.Edit2' size={16} />
            </Button>,
        );

        buttons.push(
            <Button
                color='danger'
                key={`delte-directory-${item.objectId}`}
                size='xs'
                style={{
                    padding: 0,
                    width: size,
                    height: size,
                    marginLeft: margin,
                }}
                data-id={item.objectId}
                data-tooltip={`${ENUMS.TEXT.FOLDER_EDITOR.DELETE} ${item.directory}`}
                data-align='left'
                data-vertical-align='middle'
                onClick={() => navTo('delete', { item })}>
                <Icon name='Feather.X' size={20} />
            </Button>,
        );

        return buttons;
    };

    const footer = () => {
        const { state: sceneState } = sceneRef.current || {};
        const { active, deleteFiles, selection = [] } = stateRef.current;

        const elements = [];
        const btnStyle = { padding: 0, width: 32, height: 32, marginRight: 8 };
        const tooltip = {
            'data-align': 'right',
            'data-vertical-align': 'middle',
        };

        if (active === 'list') {
            if (selection.length > 0) {
                elements.push(
                    <Button
                        {...tooltip}
                        color='danger'
                        outline
                        data-tooltip={ENUMS.TEXT.FOLDER_EDITOR.DELETE_ALL}
                        style={btnStyle}>
                        <Icon name='Feather.X' size={20} />
                    </Button>,
                );
            }

            elements.push(
                <Button
                    {...tooltip}
                    color='clear'
                    data-tooltip={ENUMS.TEXT.FOLDER_CREATOR.TITLE}
                    style={btnStyle}
                    onClick={() => navTo('add', { edit: null })}>
                    <Icon name='Feather.Plus' size={22} />
                </Button>,
            );
        }

        if (active !== 'list') {
            elements.push(
                <Button
                    {...tooltip}
                    color='clear'
                    data-tooltip={ENUMS.TEXT.BACK}
                    onClick={() => sceneRef.current.back()}
                    style={btnStyle}>
                    <Icon name='Feather.ChevronLeft' size={22} />
                </Button>,
            );
        }

        if (active === 'add') {
            elements.push(
                <div className='flex flex-grow right middle'>
                    <Button
                        onClick={() => onSaveClick()}
                        style={{ width: 175 }}>
                        {ENUMS.TEXT.FOLDER_CREATOR.SAVE}
                    </Button>
                </div>,
            );
        }

        if (active === 'delete') {
            elements.push(
                <div className='flex flex-grow right middle'>
                    <Toggle
                        defaultChecked={deleteFiles}
                        label='Delete Files?'
                        onChange={e => onDeleteFilesChange(e)}
                        value={true}
                    />
                </div>,
            );
        }

        return {
            align: 'left',
            elements,
        };
    };

    const TableHeader = () => {
        const { directories = [] } = stateRef.current;
        const { data = [], search } = tableRef.current || {};
        return (
            <Row className='bg-white-dark'>
                <Column verticalAlign='middle'>
                    {directories.length}{' '}
                    {directories.length === 1
                        ? ENUMS.TEXT.FOLDER_EDITOR.TITLE[0]
                        : ENUMS.TEXT.FOLDER_EDITOR.TITLE[1]}
                </Column>
                <Column width={200} textAlign='right'>
                    <SearchBar
                        defaultValue={search}
                        placeholder={`${ENUMS.TEXT.SEARCH} ${ENUMS.TEXT.FOLDER_EDITOR.TITLE[1]}`}
                        onChange={e =>
                            tableRef.current.setState({
                                search: e.target.value,
                            })
                        }
                    />
                </Column>
            </Row>
        );
    };

    const Table = ({ id = 'list' }) => {
        const { directories = [], search } = stateRef.current;
        return (
            <DataTable
                columns={columns()}
                data={directories}
                header={<TableHeader />}
                height={214}
                id={id}
                multiselect
                onSelect={onItemSelect}
                onUnSelect={onItemSelect}
                ref={tableRef}
                scrollable
                search={search}
                style={{ marginTop: -1 }}
            />
        );
    };

    // Side Effects
    useEffect(() => {
        const { directories, status } = stateRef.current;

        if (status !== ENUMS.STATUS.INIT) return;
        if (directories) return;

        // Get directories
        setState({ status: ENUMS.STATUS.FETCHING });

        Reactium.Cloud.run('directories', { verbose: true }).then(
            updateDirectories,
        );
    }, [
        op.get(stateRef.current, 'directories'),
        op.get(stateRef.current, 'updated'),
        op.get(stateRef.current, 'status'),
        tableRef.current,
    ]);

    const saveDirectory = ({ directory, objectId, permissions }) => {
        const updateRedux = () => {
            let { directories = [] } = getState;

            directories.push(directory);
            directories.sort();
            directories = _.uniq(directories);

            dispatch({ directories });
        };

        const updateTable = () => {
            Reactium.Cloud.run('directories', { verbose: true }).then(
                updateDirectories,
            );
        };

        // Optimistically update the store
        updateRedux();

        // Save to server
        return Reactium.Cloud.run('directory-save', {
            directory,
            objectId,
            permissions,
        }).then(result => {
            Toast.show({
                icon: 'Feather.Check',
                message: `Saved ${directory}`,
                type: Toast.TYPE.INFO,
            });

            updateTable();
            return result;
        });
    };

    const deleteDirectory = ({ directory, content }) => {
        const updateRedux = () => {
            let { directories = [] } = getState;

            directories = _.without(directories, directory);
            directories.sort();

            dispatch({ directories });
        };

        const updateTable = () => {
            const { directories = [] } = stateRef.current;
            const i = _.findIndex(directories, { directory });
            if (i > -1) directories.splice(i, 1);

            setState({ directories });
        };

        const updateFiles = () => {
            if (content !== true) return;

            const { library = {} } = getState;

            Object.entries(library).forEach(([p, files]) => {
                Object.entries(files).forEach(([id, file]) => {
                    if (file.directory !== directory) return;
                    delete files[id];
                });
            });

            dispatch({ library });
        };

        updateTable();
        updateRedux();
        updateFiles();

        return Reactium.Cloud.run('directory-delete', {
            directory,
            content,
        }).then(result => {
            Toast.show({
                icon: 'Feather.Check',
                message: `Deleted ${directory}`,
                type: Toast.TYPE.INFO,
            });

            return result;
        });
    };

    // Extern Interface
    const handle = () => ({
        deleteDirectory,
        navTo,
        saveDirectory,
    });

    useRegisterHandle('MediaDirectories', handle, [
        op.get(stateRef.current, 'directories'),
        op.get(stateRef.current, 'status'),
        tableRef.current,
    ]);

    // Renderer
    const render = () => {
        const {
            active,
            deleteFiles,
            directories = [],
            edit = {},
            status,
        } = stateRef.current;

        return (
            <div className={cname()}>
                <Dialog
                    ref={dialogRef}
                    collapsible={false}
                    dismissable={true}
                    footer={footer()}
                    header={{ title: ENUMS.TEXT.FOLDER_EDITOR.TITLE[1] }}
                    onDismiss={() => Modal.hide()}>
                    <Scene
                        active={active}
                        height={300}
                        onChange={e => onSceneChange(e)}
                        onBeforeChange={e => onSceneBeforeChange(e)}
                        ref={sceneRef}
                        width='100%'>
                        <Table id='list' />
                        <EditorPanel {...edit} id='add' ref={editorRef} />
                        <DeletePanel
                            deleteFiles={deleteFiles}
                            id='delete'
                            ref={deleteRef}
                        />
                    </Scene>
                </Dialog>
            </div>
        );
    };

    return render();
};

DirectoryEditor = forwardRef(DirectoryEditor);

DirectoryEditor.ENUMS = ENUMS;

DirectoryEditor.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

DirectoryEditor.defaultProps = {
    namespace: 'media-directory-editor',
};

export { DirectoryEditor as default };
