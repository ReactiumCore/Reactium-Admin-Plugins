import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';
import { SCENES } from './Scenes';

const Action = ({ handle }) => {
    const { cx, nav } = handle;
    const { Button } = useHookComponent('ReactiumUI');

    return (
        <div className={cx('actions')}>
            <div className={cx('label-dnd')}>{__('Drag and Drop')}</div>
            <div className={cx('label-or')}>{__('or')}</div>
            <div className={cx('btn-container')}>
                <Button
                    appearance={Button.ENUMS.APPEARANCE.PILL}
                    color={Button.ENUMS.COLOR.TERTIARY}
                    onClick={() => nav(SCENES.library)}
                    outline
                    size={Button.ENUMS.SIZE.SM}>
                    {__('Select From Media')}
                </Button>
            </div>
            <div className={cx('btn-container')}>
                <Button
                    appearance={Button.ENUMS.APPEARANCE.PILL}
                    color={Button.ENUMS.COLOR.TERTIARY}
                    onClick={() => nav(SCENES.external)}
                    outline
                    size={Button.ENUMS.SIZE.SM}>
                    {__('Import From URL')}
                </Button>
            </div>
            <div className={cx('btn-container')}>
                <Button
                    appearance={Button.ENUMS.APPEARANCE.PILL}
                    color={Button.ENUMS.COLOR.PRIMARAY}
                    onClick={() => nav(SCENES.upload)}
                    size={Button.ENUMS.SIZE.sm}>
                    {__('Upload A File')}
                </Button>
            </div>
        </div>
    );
};

export default Action;
