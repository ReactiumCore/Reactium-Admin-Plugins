import React from 'react';
import cn from 'classnames';
import ENUMS from '../enums';
import domain from '../domain';
import { Button, Icon } from 'reactium-ui';
import { useHandle, useWindowSize, Zone } from 'reactium-core/sdk';

const Empty = ({ Media }) => {
    Media = Media || useHandle(domain.name);

    const { breakpoint } = useWindowSize();

    const onBrowseClick = e => Media.browseFiles(e);

    const isMobile = () => ['xs', 'sm'].includes(breakpoint);

    const mobile = isMobile();

    return (
        <div className={cn(Media.cname('library'), 'empty')}>
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
        </div>
    );
};

export default Empty;
