import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

export default ({ picker }) => {
    const { cx, state, unselectAll } = picker;
    const { remaining, maxSelect, selection = [] } = state;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const isVisible = selection.length > 0 && maxSelect && maxSelect !== 1;
    const msg = __('%count of %max')
        .replace(/\%count/gi, selection.length)
        .replace(/\%max/gi, maxSelect);

    return isVisible ? (
        <div className={cx('remaining')}>
            <div className={cx('remaining-label')}>{msg}</div>
            {remaining !== maxSelect && (
                <Button
                    className={cx('remaining-clear-button')}
                    color={Button.ENUMS.COLOR.CLEAR}
                    onClick={unselectAll}>
                    <Icon name='Feather.XSquare' />
                </Button>
            )}
        </div>
    ) : null;
};
