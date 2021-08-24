import React from 'react';
import op from 'object-path';
import { useHookComponent } from 'reactium-core/sdk';

export default ({ picker }) => {
    const { cx, submit, state } = picker;
    const selection = op.get(state, 'selection', []);
    const { Button } = useHookComponent('ReactiumUI');

    return selection.length > 0 && state.confirm === true ? (
        <div className={cx('footer-submit-container')}>
            <Button
                className={cx('footer-submit-button')}
                color={Button.ENUMS.COLOR.PRIMARY}
                onClick={() => submit()}
                size={Button.ENUMS.SIZE.SM}>
                {state.submitLabel}
            </Button>
        </div>
    ) : null;
};
