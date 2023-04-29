import React from 'react';
import IconImg from './IconImg';
import { Button } from 'reactium-ui';
import { __ } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Empty
 * -----------------------------------------------------------------------------
 */
const Empty = () => (
    <div className='admin-content-type-list-empty'>
        <IconImg />
        <Button
            appearance={Button.ENUMS.APPEARANCE.PILL}
            className='hide-xs show-md'
            size={Button.ENUMS.SIZE.LG}
            type={Button.ENUMS.TYPE.LINK}
            to='/admin/type/new'>
            {__('New Content Type')}
        </Button>
        <Button
            appearance={Button.ENUMS.APPEARANCE.PILL}
            className='hide-md'
            size={Button.ENUMS.SIZE.MD}
            type={Button.ENUMS.TYPE.LINK}
            to='/admin/type/new'>
            {__('New Content Type')}
        </Button>
    </div>
);

export { Empty, Empty as default };
