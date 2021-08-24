import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';

export default ({ picker }) => {
    const { cx, dismiss, state } = picker;
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return state.dismissable ? (
        <Button
            className={cx('toolbar-dismiss-button')}
            color={Button.ENUMS.COLOR.CLEAR}
            onClick={dismiss}>
            <Icon name='Feather.X' size={18} />
        </Button>
    ) : null;
};
