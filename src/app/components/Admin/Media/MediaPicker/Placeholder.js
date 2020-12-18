import React from 'react';
import cn from 'classnames';
import { useHookComponent } from 'reactium-core/sdk';

export default ({ picker, url, type = 'UPLOAD' }) => {
    const { cx } = picker;
    const { Button, Icon, Spinner } = useHookComponent('ReactiumUI');

    const ico =
        String(type).toUpperCase() === 'IMPORT'
            ? 'Feather.DownloadCloud'
            : 'Feather.UploadCloud';

    return (
        <div className={cn(cx('item'), 'placeholder', 'block')}>
            <div className='title'>{url}</div>
            <Button readOnly color='clear' className='upload'>
                <Icon name={ico} />
            </Button>
            <Spinner />
        </div>
    );
};
