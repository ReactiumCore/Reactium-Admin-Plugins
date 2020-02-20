import React from 'react';
import ENUMS from '../enums';
import domain from '../domain';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import { useHandle, useWindowSize, Zone } from 'reactium-core/sdk';

export default () => {
    const Media = useHandle(domain.name);

    const { breakpoint } = useWindowSize();

    const onBrowseClick = e => Media.browseFiles(e);

    const isMobile = () => ['xs', 'sm'].includes(breakpoint);

    const render = () => {
        const mobile = isMobile();

        return !Media.isEmpty() ? null : (
            <>
                <div className='label'>
                    <Icon name='Linear.CloudUpload' size={mobile ? 96 : 128} />
                    <div className='my-xs-32 my-md-40 hide-xs show-md'>
                        {ENUMS.TEXT.EMPTY}
                    </div>
                    <Button
                        color='primary'
                        appearance='pill'
                        onClick={onBrowseClick}
                        size={mobile ? 'md' : 'lg'}>
                        {ENUMS.TEXT.BROWSE}
                    </Button>
                </div>
                <Zone zone='admin-media-empty' />
            </>
        );
    };

    return render();
};
