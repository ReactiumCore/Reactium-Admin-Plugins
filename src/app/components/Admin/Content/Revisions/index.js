import React, { useRef, useEffect } from 'react';
import Reactium, {
    __,
    useDerivedState,
    useAsyncEffect,
} from 'reactium-core/sdk';
import { Button, Icon, Scene } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import _ from 'underscore';
import ENUMS from './enums';
import {
    MainScene,
    BranchesScene,
    RevisionsScene,
    SettingsScene,
} from './Scenes';
import { Scrollbars } from 'react-custom-scrollbars';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Revisions
 * -----------------------------------------------------------------------------
 */
const Revisions = props => {
    // props derived
    const modalFrame = useRef();
    const sceneRef = useRef();
    const editor = op.get(props, 'editor');
    const startingContent = op.get(props, 'startingContent');
    const startingBranches = op.get(startingContent, 'branches', {});
    const startingBranch = op.get(startingContent, 'history.branch', 'master');
    const startingRevision = op.get(startingRevision, 'history.revision', 0);
    const onClose = op.get(props, 'onClose');

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
        },
        ['branches'],
    );

    console.log({ state });

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
        console.log({ branch, target, request });
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

    useEffect(() => {
        // focus frame on load
        if (modalFrame.current) {
            modalFrame.current.focus();
        }
    }, []);

    const handle = {
        cx,
        state,
        setState,
        navTo,
        setBranch,
        cloneBranch,
        labelBranch,
        editor,
        onClose,
    };

    return (
        <div className={cx()} tabIndex={0} ref={modalFrame}>
            <div className={cx('content')}>
                <Scene ref={sceneRef} active={state.activeScene}>
                    {Object.entries({
                        main: MainScene,
                        branches: BranchesScene,
                        revisions: RevisionsScene,
                        settings: SettingsScene,
                    }).map(([id, Component]) => (
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
                    ))}
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

export default Revisions;
