import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import ENUMS from 'components/Admin/Media/enums';
import domain from 'components/Admin/Media/domain';
import Creator, { FolderInput } from 'components/Admin/Media/Directory/Creator';

import Reactium, {
    useHandle,
    useHookComponent,
    useReduxState,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useLayoutEffect as useWindowEffect,
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
} from '@atomic-reactor/reactium-ui';

import { Column, Row, SearchBar } from '@atomic-reactor/reactium-ui/DataTable';

// import Scene from 'components/Reactium-UI/Scene';

// Server-Side Render safe useLayoutEffect (useEffect when node)
const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const noop = forwardRef((props, ref) => null);

/**
 * -----------------------------------------------------------------------------
 * Hook Component: DirectoryEditor
 * -----------------------------------------------------------------------------
 */
let DirectoryEditor = ({ className, namespace, ...props }, ref) => {
    const [getState, dispatch] = useReduxState(domain.name);

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const Toast = op.get(tools, 'Toast');

    const PermissionSelector = useHookComponent('PermissionSelector', noop);

    // Refs
    const dialogRef = useRef();

    const sceneRef = useRef();

    const stateRef = useRef({
        active: 'list',
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

    const onItemSelect = e => {
        const { data = [] } = tableRef.current;
        const selection = data.filter(item => item.selected === true);
        setState({ selection });
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

    const Actions = item => {
        const buttons = [];

        const size = 32;
        const margin = 12;

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
                data-vertical-align='middle'>
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
                data-vertical-align='middle'>
                <Icon name='Feather.X' size={20} />
            </Button>,
        );

        return buttons;
    };

    const footer = () => {
        const { state: sceneState } = sceneRef.current || {};
        const { active, selection = [] } = stateRef.current;

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
                    onClick={() =>
                        sceneRef.current.navTo({
                            panel: 'add',
                            direction: 'left',
                        })
                    }>
                    <Icon name='Feather.Plus' size={22} />
                </Button>,
            );
        }

        if (active === 'add') {
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

            elements.push(
                <div className='flex flex-grow right middle'>
                    <Button onChange={() => {}} style={{ width: 175 }}>
                        {ENUMS.TEXT.FOLDER_CREATOR.SAVE}
                    </Button>
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
                    <span className='pl-xs-4'>
                        {directories.length} {ENUMS.TEXT.FOLDER_EDITOR.TITLE}
                    </span>
                </Column>
                <Column width={200} textAlign='right'>
                    <SearchBar
                        defaultValue={search}
                        placeholder={`${ENUMS.TEXT.SEARCH} ${ENUMS.TEXT.FOLDER_EDITOR.TITLE}`}
                        onChange={onSceneChange}
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
                height={300}
                id={id}
                multiselect
                onSelect={onItemSelect}
                onUnSelect={onItemSelect}
                ref={tableRef}
                scrollable
                search={search}
                selectable
                style={{ marginTop: -1 }}
            />
        );
    };

    // Renderer
    const render = () => {
        const {
            active,
            canRead,
            canWrite,
            directories = [],
            directory,
            status,
        } = stateRef.current;

        return (
            <div className={cname()}>
                <Dialog
                    ref={dialogRef}
                    collapsible={false}
                    dismissable={true}
                    footer={footer()}
                    header={{ title: ENUMS.TEXT.FOLDER_EDITOR.TITLE }}
                    onDismiss={() => Modal.hide()}>
                    <Scene
                        active={active}
                        height={300}
                        onChange={e => {
                            setState({ active: e.active });
                        }}
                        width='100%'
                        ref={sceneRef}>
                        <Table id='list' />
                        <div
                            id='add'
                            className='admin-directory-editor'
                            style={{ width: '100%' }}>
                            <div className='py-xs-16'>
                                <FolderInput directory={directory} />
                                <PermissionSelector
                                    canRead={canRead}
                                    canWrite={canWrite}
                                />
                            </div>
                        </div>
                    </Scene>
                </Dialog>
            </div>
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
            directories => {
                directories = directories.map(item => {
                    item.actions = <Actions {...item} />;
                    return item;
                });

                setState({ directories, status: ENUMS.STATUS.READY });
            },
        );
    }, [
        op.get(stateRef.current, 'directories'),
        op.get(stateRef.current, 'status'),
        tableRef.current,
    ]);

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
    namespace: 'media-directory-editor',
};

export { DirectoryEditor as default };
