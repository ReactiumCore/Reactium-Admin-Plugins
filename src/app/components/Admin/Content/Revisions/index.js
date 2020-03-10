import React, { useRef, useEffect } from 'react';
import Reactium, {
    __,
    useDerivedState,
    useAsyncEffect,
} from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import _ from 'underscore';
import ENUMS from './enums';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Revisions
 * -----------------------------------------------------------------------------
 */
const Revisions = props => {
    // props derived
    const modalFrame = useRef();
    const editor = op.get(props, 'editor');
    const startingContent = op.get(props, 'startingContent');
    const startingBranches = op.get(startingContent, 'branches', {});
    const startingBranch = op.get(startingContent, 'history.branch', 'master');
    const startingRevision = op.get(startingRevision, 'history.revision', 0);
    const onClose = op.get(props, 'onClose');

    const [state, setState] = useDerivedState(
        {
            branches: startingBranches,
            currentBranch: startingBranch,
            working: {
                content: startingContent,
                branch: startingBranch,
                revision: startingRevision,
            },
            checkout: null,
        },
        ['branches'],
    );

    const cx = Reactium.Utils.cxFactory('revision-manager');

    useEffect(() => {
        // focus frame on load
        if (modalFrame.current) {
            modalFrame.current.focus();
        }
    }, []);

    console.log({ state });

    return (
        <div className={cx()} tabIndex={0} ref={modalFrame}>
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

            <div className={cx('content')}>Revisions</div>
        </div>
    );
};

export default Revisions;
