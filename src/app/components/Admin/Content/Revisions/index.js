import React, { useRef, useEffect } from 'react';
import Reactium, { __, useDerivedState, useHandle } from 'reactium-core/sdk';
import { Button, Icon, Scene } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import _ from 'underscore';
import ENUMS from './enums';
import { Scrollbars } from 'react-custom-scrollbars';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: RevisionManager
 * -----------------------------------------------------------------------------
 */
const RevisionManager = props => {
    // props derived
    const modalFrame = useRef();
    const sceneRef = useRef();
    const editor = op.get(props, 'editor');
    const type = op.get(editor, 'type');
    const types = op.get(editor, 'types');
    const startingContent = op.get(props, 'startingContent');
    const startingBranches = op.get(startingContent, 'branches', {});
    const startingBranch = op.get(startingContent, 'history.branch', 'master');
    const startingRevision = op.get(startingRevision, 'history.revision', 0);
    const onClose = op.get(props, 'onClose');
    const tools = useHandle('AdminTools');
    const Toast = op.get(tools, 'Toast');

    const [state, setState] = useDerivedState(
        {
            branches: startingBranches,
            working: {
                content: startingContent,
                branch: startingBranch,
                revision: startingRevision,
            },
            compare: {},
            activeScene: 'main',
            type,
            types,
        },
        ['branches'],
    );

    const cx = Reactium.Utils.cxFactory('revision-manager');

    const navTo = (panel, direction = 'left', newState) => {
        const sceneState = {
            activeScene: panel,
            ...(newState ? newState : {}),
        };

        setState(sceneState);
        sceneRef.current.navTo({
            panel,
            direction,
        });
    };

    const setBranch = async (branch, target = 'working') => {
        const request = {
            ...op.get(state, 'working.content', {}),
            history: {
                branch,
            },
        };

        const content = await Reactium.Content.retrieve(request);

        updateBranchInfo(content, target);
    };

    const cloneBranch = async branchLabel => {
        const fromContent = op.get(state, 'working.content');
        const fromBranch = op.get(state, 'working.branch');
        const fromLabel = op.get(state, ['branches', fromBranch, 'label']);
        if (!branchLabel)
            branchLabel = __('Copy of %label').replace('%label', fromLabel);

        const request = {
            ...fromContent,
            branchLabel,
        };

        const content = await Reactium.Content.cloneBranch(request);
        updateBranchInfo(content);
    };

    const labelBranch = async branchLabel => {
        const fromContent = op.get(state, 'working.content');

        const request = {
            ...fromContent,
            branchLabel,
        };

        const content = await Reactium.Content.labelBranch(request);
        updateBranchInfo(content);
    };

    const updateBranchInfo = (content, target = 'working') => {
        const branches = op.get(content, 'branches', {});
        const history = op.get(content, 'history', {});

        setState({
            branches,
            [target]: {
                content,
                branch: history.branch,
                revision: history.revision,
            },
        });
    };

    const stageBranchChanges = (changes, target = 'working') => {
        const currentTarget = op.get(state, target, {});
        const currentChanges = op.get(state, [target, 'changes'], {});
        setState({
            [target]: {
                ...currentTarget,
                changes: {
                    ...currentChanges,
                    ...changes,
                },
            },
        });
    };

    const unstageBranchChange = (slug, target = 'working') => {
        const currentTarget = op.get(state, target, {});
        const currentChanges = op.get(state, [target, 'changes'], {});
        op.del(currentChanges, slug);

        setState({
            [target]: {
                ...currentTarget,
                changes: {
                    ...currentChanges,
                },
            },
        });
    };

    const deleteBranch = async () => {
        try {
            const working = op.get(state, 'working.content', {});
            const branch = op.get(working, 'history.branch');
            if (branch === 'master') return;

            const updated = await Reactium.Content.deleteBranch(working);
            op.set(updated, 'history', { branch: 'master' });
            const content = await Reactium.Content.retrieve(updated);
            updateBranchInfo(content);
            Toast.show({
                type: Toast.TYPE.SUCCESS,
                message: __('Version deleted'),
                icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                autoClose: 1000,
            });

            await editor.dispatch('load', {
                value: content,
                ignoreChangeEvent: true,
            });
            onClose();
        } catch (error) {
            Toast.show({
                type: Toast.TYPE.ERROR,
                message: __('Unable to deleted version'),
                icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
                autoClose: 1000,
            });

            navTo('main', 'right');
        }
    };

    const updateEditor = async value => {
        if (
            op.get(editor, 'value.history.branch') ===
            op.get(value, 'history.branch')
        ) {
            await editor.dispatch('load', {
                value,
                ignoreChangeEvent: true,
            });
        }
    };

    const saveChanges = async () => {
        const workingChanges = op.get(state, 'working.changes', {});
        const compareChanges = op.get(state, 'compare.changes', {});
        const working = op.get(state, 'working.content', {});
        const compare = op.get(state, 'compare.content', {});

        if (Object.keys(workingChanges).length) {
            const content = await Reactium.Content.save({
                ...working,
                ...workingChanges,
            });
            updateBranchInfo(content, 'working');
            updateEditor(content);
        }

        if (Object.keys(compareChanges).length) {
            const content = await Reactium.Content.save({
                ...compare,
                ...compareChanges,
            });
            updateBranchInfo(content, 'compare');
            updateEditor(content);
        }

        Toast.show({
            type: Toast.TYPE.SUCCESS,
            message: __('Content updated'),
            icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
            autoClose: 1000,
        });
    };

    const currentBranch = op.get(state, 'working.branch');

    const getVersionLabel = branchId =>
        op.get(state, ['branches', branchId, 'label'], 'Unknown');

    const labels = key => {
        const enums = {};
        Object.entries(op.get(ENUMS, key, {})).forEach(([name, value = '']) => {
            op.set(
                enums,
                name,
                value.replace('%version', getVersionLabel(currentBranch)),
            );
        });

        return enums;
    };

    useEffect(() => {
        // focus frame on load
        if (modalFrame.current) {
            modalFrame.current.focus();
        }
    }, []);

    useEffect(() => {
        const loadRevisions = async () => {
            const revHistory = await Reactium.Content.revisions(
                op.get(state, 'working.content'),
            );

            const revisions = op.get(revHistory, 'revisions', []);
            setState({
                revHistory,
                revId: op.get(revisions, [revisions.length - 1, 'revId']),
            });
        };

        if (currentBranch) {
            loadRevisions();
        }
    }, [currentBranch, state.branches]);

    const handle = {
        cx,
        state,
        setState,
        navTo,
        setBranch,
        cloneBranch,
        labelBranch,
        deleteBranch,
        editor,
        onClose,
        labels,
        stageBranchChanges,
        unstageBranchChange,
        saveChanges,
    };

    return (
        <div className={cx()} tabIndex={0} ref={modalFrame}>
            <div className={cx('content')}>
                <Scene ref={sceneRef} active={state.activeScene}>
                    {Object.entries(op.get(ENUMS, 'SCENES', {})).map(
                        ([id, config]) => {
                            const { Component, scrollbars } = config;
                            if (scrollbars) {
                                return (
                                    <Scrollbars
                                        id={id}
                                        key={id}
                                        className={cx('scene')}
                                        style={{
                                            width: 'calc(100vw - 40px)',
                                            height: 'calc(100vh - 120px)',
                                        }}>
                                        <Component handle={handle} />
                                    </Scrollbars>
                                );
                            }
                            return (
                                <div id={id} key={id} className={cx('scene')}>
                                    <Component handle={handle} />
                                </div>
                            );
                        },
                    )}
                </Scene>
            </div>

            <div className={cx('controls')}>
                <Button
                    className={cx('back')}
                    disabled={state.activeScene === 'main'}
                    size={Button.ENUMS.SIZE.XS}
                    color={Button.ENUMS.COLOR.CLEAR}
                    title={ENUMS.BACK_BUTTON.tooltip}
                    data-tooltip={ENUMS.BACK_BUTTON.tooltip}
                    data-align='right'
                    data-vertical-align='middle'
                    onClick={() => {
                        navTo('main', 'right');
                    }}>
                    <Icon name={'Feather.ChevronLeft'} />
                    <span className='sr-only'>{ENUMS.BACK_BUTTON.label}</span>
                </Button>
                <h2 className='h3 strong'>
                    {op.get(ENUMS, ['SCENES', state.activeScene, 'title'], '')}
                </h2>
                <Button
                    className={cx('close')}
                    size={Button.ENUMS.SIZE.XS}
                    color={Button.ENUMS.COLOR.CLEAR}
                    title={ENUMS.CLOSE.tooltip}
                    data-tooltip={ENUMS.CLOSE.tooltip}
                    data-align='left'
                    data-vertical-align='middle'
                    onClick={onClose}>
                    <Icon name={'Feather.X'} />
                    <span className='sr-only'>{ENUMS.CLOSE.label}</span>
                </Button>
            </div>
        </div>
    );
};

export default RevisionManager;
