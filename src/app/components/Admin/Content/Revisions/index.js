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
import { MainScene, BranchesScene, RevisionsScene } from './Scenes';
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
    console.log({ editor, startingContent, startingBranch });
    const [state, setState] = useDerivedState(
        {
            branches: startingBranches,
            currentBranch: startingBranch,
            working: {
                content: startingContent,
                branch: startingBranch,
                revision: startingRevision,
            },
            compare: null,
            activeScene: 'main',
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

    const setBranch = branch => {
        if (branch !== state.currentBranch) {
            setState({ currentBranch: branch });
            setBranchContent(branch);
        }
    };

    const setBranchContent = (branch, target = 'working') => {
        const request = {
            ...op.get(state, 'working.content', {}),
            history: {
                branch,
            },
        };

        Reactium.Content.retrieve(request).then(content => {
            const history = op.get(content, 'history', {});
            setState({
                [target]: {
                    content,
                    branch: history.branch,
                    revision: history.revision,
                },
            });
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
        setBranchContent,
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
